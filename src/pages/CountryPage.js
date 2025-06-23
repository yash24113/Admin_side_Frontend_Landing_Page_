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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Download } from "@mui/icons-material";
import axios from "axios";
import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BACKEND_API = "https://langingpage-production-f27f.up.railway.app";

function CountryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [open, setOpen] = useState(false);
  const [editCountry, setEditCountry] = useState(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(3);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const fetchCountries = async () => {
    const res = await axios.get(`${BACKEND_API}/api/countries`);
    setCountries(res.data);
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleOpen = (country = null) => {
    setEditCountry(country);
    setForm(
      country
        ? { name: country.name, code: country.code }
        : { name: "", code: "" }
    );
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCountry(null);
    setForm({ name: "", code: "" });
    setError("");
  };

  const handleSubmit = async () => {
    try {
      if (editCountry) {
        await axios.put(
          `${BACKEND_API}/api/countries/${editCountry._id}`,
          form
        );
      } else {
        await axios.post(`${BACKEND_API}/api/countries`, form);
      }
      fetchCountries();
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
    await axios.delete(`${BACKEND_API}/api/countries/${id}`);
    fetchCountries();
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "Country", flex: 1, filterable: true },
    { field: "code", headerName: "Code", flex: 1, filterable: true },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpen(params.row)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)}>
            <Delete />
          </IconButton>
        </>
      ),
      width: 120,
    },
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return countries;
    return countries.filter((country) => {
      const s = search.toLowerCase();
      return (
        country.name?.toLowerCase().includes(s) ||
        country.code?.toLowerCase().includes(s)
      );
    });
  }, [countries, search]);

  // CSV export data
  const csvData = filteredRows.map((country) => ({
    Country: country.name,
    Code: country.code,
  }));

  // PDF export
  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Countries", 14, 10);
    autoTable(doc, {
      head: [["Country", "Code"]],
      body: filteredRows.map((country) => [country.name, country.code]),
    });
    doc.save("countries.pdf");
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Countries
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add Country
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
          filename="countries.csv"
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
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editCountry ? "Edit Country" : "Add Country"}
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
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editCountry ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CountryPage;
