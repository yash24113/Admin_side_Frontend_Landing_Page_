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
import { toast } from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";
// Use environment variable for API
const BACKEND_API = process.env.REACT_APP_BACKEND_API;

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
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [pendingForm, setPendingForm] = useState(null);

  useEffect(() => {
    if (!loading && (!user || (user && user.isVerified === false))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Try to load cached countries from localStorage for instant render
    const cached = localStorage.getItem("countries_cache");
    if (cached) {
      try {
        setCountries(JSON.parse(cached));
        setIsLoading(false); // Show cached data instantly
      } catch (e) {
        // Ignore parse errors
      }
    }
    fetchCountries(); // Always fetch fresh data in background
  }, []);

  const fetchCountries = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/countries`);
      setCountries(res.data);
      localStorage.setItem("countries_cache", JSON.stringify(res.data)); // Cache for ISR
    } catch (err) {
      setFetchError("Failed to fetch countries.");
    } finally {
      setIsLoading(false);
    }
  };

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
    setPendingForm({ ...form });
    setConfirmType("update");
    setConfirmOpen(true);
  };

  const handleDelete = (id) => {
    setPendingId(id);
    setConfirmType("delete");
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (confirmType === "delete") {
      try {
        await axios.delete(`${BACKEND_API}/api/countries/${pendingId}`);
        fetchCountries();
        toast.success("Country deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err, err.response?.data);
        toast.error("Failed to delete country.");
      }
      setPendingId(null);
    } else if (confirmType === "update") {
      try {
        console.log("Submitting form:", pendingForm);
        if (editCountry) {
          await axios.put(`${BACKEND_API}/api/countries/${editCountry._id}`, pendingForm);
          toast.success("Country updated successfully!");
        } else {
          await axios.post(`${BACKEND_API}/api/countries`, pendingForm);
          toast.success("Country added successfully!");
        }
        fetchCountries();
        handleClose();
      } catch (err) {
        console.error("Add/Update error:", err, err.response?.data);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
          toast.error(err.response.data.message);
        } else {
          setError("An unexpected error occurred.");
          toast.error("An unexpected error occurred.");
        }
      }
      setPendingForm(null);
    }
    setConfirmOpen(false);
    setConfirmType("");
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
        <CSVLink data={csvData} filename="countries.csv" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export CSV
          </Button>
        </CSVLink>
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
      <ConfirmDialog
        open={confirmOpen}
        title={confirmType === "delete" ? "Confirm Delete" : "Confirm Save"}
        content={confirmType === "delete" ? "Are you sure you want to delete this country?" : (editCountry ? "Are you sure you want to update this country?" : "Are you sure you want to add this country?")}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
      />
    </Box>
  );
}

export default CountryPage;
