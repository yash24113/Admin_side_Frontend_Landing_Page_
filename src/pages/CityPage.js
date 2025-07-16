import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  TextField,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Download } from "@mui/icons-material";
import axios from "axios";
// Use environment variable for API

import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";
const BACKEND_API = process.env.REACT_APP_BACKEND_API;
function CityPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [open, setOpen] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [form, setForm] = useState({ name: "", country: "", state: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [pendingForm, setPendingForm] = useState(null);

  const fetchCities = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/cities`);
      const cleaned = res.data.map((city) => ({
        ...city,
        state: city.state || null,
        country: city.country || null,
      }));
      setCities(cleaned);
      localStorage.setItem("cities_cache", JSON.stringify(cleaned));
    } catch (err) {
      setFetchError("Failed to fetch cities.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCountries = async () => {
    const res = await axios.get(`${BACKEND_API}/api/countries`);
    setCountries(res.data);
  };
  const fetchStates = async (countryId) => {
    if (!countryId) return setStates([]);
    const res = await axios.get(
      `${BACKEND_API}/api/states/country/${countryId}`
    );
    setStates(res.data);
  };

  useEffect(() => {
    if (!loading && (!user || (user && user.isVerified === false))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Try to load cached cities from localStorage for instant render
    const cached = localStorage.getItem("cities_cache");
    if (cached) {
      try {
        setCities(JSON.parse(cached));
        setIsLoading(false); // Show cached data instantly
      } catch (e) {
        // Ignore parse errors
      }
    }
    fetchCities(); // Always fetch fresh data in background
    fetchCountries();
  }, []);

  useEffect(() => {
    if (form.country) fetchStates(form.country);
    else setStates([]);
  }, [form.country]);

  const handleOpen = (city = null) => {
    setEditCity(city);
    setForm(
      city
        ? {
            name: city.name,
            country: city.country?._id || "",
            state: city.state?._id || "",
          }
        : { name: "", country: "", state: "" }
    );
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCity(null);
    setForm({ name: "", country: "", state: "" });
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

  const handleUpdate = () => {
    setPendingForm({ ...form });
    setConfirmType("update");
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (confirmType === "delete") {
      try {
        await axios.delete(`${BACKEND_API}/api/cities/${pendingId}`);
        fetchCities();
        toast.success("City deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete city.");
      }
      setPendingId(null);
    } else if (confirmType === "update") {
      try {
        if (editCity) {
          await axios.put(`${BACKEND_API}/api/cities/${editCity._id}`, pendingForm);
          toast.success("City updated successfully!");
        } else {
          await axios.post(`${BACKEND_API}/api/cities`, pendingForm);
          toast.success("City added successfully!");
        }
        fetchCities();
        handleClose();
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setError(
            err.response.data.message ||
              (err.response.data.errors && err.response.data.errors[0]?.msg) ||
              "Request failed with status code 400"
          );
          toast.error(err.response.data.message || "Request failed with status code 400");
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
    { field: "name", headerName: "City", flex: 1, filterable: true },
    {
      field: "state",
      headerName: "State",
      flex: 1,
      renderCell: (params) => params.row.state?.name || "",
      filterable: true,
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      renderCell: (params) => params.row.country?.name || "",
      filterable: true,
    },
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
    if (!search) return cities;
    return cities.filter((city) => {
      const s = search.toLowerCase();
      return (
        city.name?.toLowerCase().includes(s) ||
        city.state?.name?.toLowerCase().includes(s) ||
        city.country?.name?.toLowerCase().includes(s)
      );
    });
  }, [cities, search]);

  // CSV export data
  const csvData = filteredRows.map((city) => ({
    City: city.name,
    State: city.state?.name || "",
    Country: city.country?.name || "",
  }));

  // PDF export
  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Cities", 14, 10);
    autoTable(doc, {
      head: [["City", "State", "Country"]],
      body: filteredRows.map((city) => [
        city.name,
        city.state?.name || "",
        city.country?.name || "",
      ]),
    });
    doc.save("cities.pdf");
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Cities
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add City
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <CSVLink data={csvData} filename="cities.csv" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<Download />}>Export CSV</Button>
        </CSVLink>
        <Button variant="outlined" startIcon={<Download />} onClick={handleExportPDF}>
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
        <DialogTitle>{editCity ? "Edit City" : "Add City"}</DialogTitle>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Country</InputLabel>
            <Select
              value={form.country}
              label="Country"
              onChange={(e) =>
                setForm({ ...form, country: e.target.value, state: "" })
              }
            >
              {countries.map((country) => (
                <MenuItem key={country._id} value={country._id}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>State</InputLabel>
            <Select
              value={form.state}
              label="State"
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              disabled={!form.country}
            >
              {states.map((state) => (
                <MenuItem key={state._id} value={state._id}>
                  {state.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            {editCity ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        title={confirmType === "delete" ? "Confirm Delete" : "Confirm Save"}
        content={confirmType === "delete" ? "Are you sure you want to delete this city?" : (editCity ? "Are you sure you want to update this city?" : "Are you sure you want to add this city?")}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
      />
    </Box>
  );
}

export default CityPage;
