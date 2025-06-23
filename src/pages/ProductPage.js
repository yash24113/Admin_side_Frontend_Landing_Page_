import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Download } from "@mui/icons-material";
import axios from "axios";
import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BACKEND_API = "https://langingpage-production-f27f.up.railway.app";

function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

function ProductPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/products`);
      setProducts(res.data);
    } catch (err) {
      setFetchError("Failed to fetch products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpen = (product = null) => {
    setEditProduct(product);
    setForm(
      product
        ? {
            name: product.name,
            description: product.description,
            slug: product.slug,
          }
        : { name: "", description: "", slug: "" }
    );
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
    setForm({ name: "", description: "", slug: "" });
    setError("");
  };

  const handleSubmit = async () => {
    try {
      if (!isValidSlug(form.slug)) {
        setError(
          "Slug can only contain lowercase letters, numbers, and hyphens. No spaces or other characters allowed."
        );
        return;
      }
      if (editProduct) {
        await axios.put(`${BACKEND_API}/api/products/${editProduct._id}`, form);
      } else {
        await axios.post(`${BACKEND_API}/api/products`, form);
      }
      fetchProducts();
      handleClose();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(
          err.response.data.message ||
            (err.response.data.errors && err.response.data.errors[0]?.msg) ||
            "Request failed with status code 400"
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BACKEND_API}/api/products/${id}`);
    fetchProducts();
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1, filterable: true },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      filterable: true,
    },
    { field: "slug", headerName: "Slug", flex: 1, filterable: true },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (!params.row) return null; // Guard against null row
        return (
          <>
            <IconButton onClick={() => handleOpen(params.row)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(params.row._id)}>
              <Delete />
            </IconButton>
          </>
        );
      },
      width: 120,
    },
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return products;
    return products.filter((product) => {
      const s = search.toLowerCase();
      return (
        product.name?.toLowerCase().includes(s) ||
        product.description?.toLowerCase().includes(s) ||
        product.slug?.toLowerCase().includes(s)
      );
    });
  }, [products, search]);

  // CSV export data
  const csvData = filteredRows.map((product) => ({
    Name: product.name,
    Description: product.description,
    Slug: product.slug,
  }));

  // PDF export
  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Products", 14, 10);
    autoTable(doc, {
      head: [["Name", "Description", "Slug"]],
      body: filteredRows.map((product) => [
        product.name,
        product.description,
        product.slug,
      ]),
    });
    doc.save("products.pdf");
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Products
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Button
          variant="outlined"
          startIcon={<Download />}
          component={CSVLink}
          data={csvData}
          filename="products.csv"
        >
          Export CSV
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>
      </Stack>
      <Box sx={{ height: 400, width: "100%" }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : fetchError ? (
          <Alert severity="error">{fetchError}</Alert>
        ) : filteredRows.length === 0 ? (
          <Alert severity="info">No data found.</Alert>
        ) : (
          <DataGrid
            rows={filteredRows.map((row) => ({ ...row, id: row._id }))}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={[3, 6, 9, 15]}
            pagination
            components={{ Toolbar: GridToolbar }}
            disableSelectionOnClick
            autoHeight
          />
        )}
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editProduct ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            fullWidth
            margin="normal"
            helperText="Enter a unique URL-friendly identifier (e.g., 'my-product-name')"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editProduct ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductPage;
