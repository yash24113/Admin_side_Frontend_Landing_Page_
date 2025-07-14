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
import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";

const BACKEND_API = "https://age-landing-backend.egport.com";

function LocationPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    country: "",
    state: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [pendingForm, setPendingForm] = useState(null);

  const fetchLocations = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/locations`);
      setLocations(res.data);
      localStorage.setItem("locations_cache", JSON.stringify(res.data));
    } catch (err) {
      setFetchError("Failed to fetch locations.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCountries = async () => {
    const res = await axios.get(`${BACKEND_API}/api/countries`);
    setCountries(res.data);
  };
  const fetchStates = async () => {
    const res = await axios.get(`${BACKEND_API}/api/states`);
    setStates(res.data);
  };
  const fetchCities = async () => {
    const res = await axios.get(`${BACKEND_API}/api/cities`);
    setCities(res.data);
  };

  useEffect(() => {
    if (!loading && (!user || (user && user.isVerified === false))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const cached = localStorage.getItem("locations_cache");
    if (cached) {
      try {
        setLocations(JSON.parse(cached));
        setIsLoading(false);
      } catch (e) {
        // Ignore parse errors
      }
    }
    fetchLocations();
    fetchCountries();
    fetchStates();
    fetchCities();
  }, []);

  const handleOpen = (location = null) => {
    setEditLocation(location);
    setForm(
      location
        ? {
            name: location.name,
            slug: location.slug,
            country: location.country?._id || "",
            state: location.state?._id || "",
            city: location.city?._id || "",
          }
        : {
            name: "",
            slug: "",
            country: "",
            state: "",
            city: "",
          }
    );
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLocation(null);
    setForm({
      name: "",
      slug: "",
      country: "",
      state: "",
      city: "",
    });
    setError("");
  };

  function isValidSlug(slug) {
    return /^[a-z0-9-]+$/.test(slug);
  }

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
        await axios.delete(`${BACKEND_API}/api/locations/${pendingId}`);
        fetchLocations();
        toast.success("Location deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err, err.response?.data);
        toast.error("Failed to delete location.");
      }
      setPendingId(null);
    } else if (confirmType === "update") {
      try {
        console.log("Submitting form:", pendingForm);
        if (editLocation) {
          await axios.put(`${BACKEND_API}/api/locations/${editLocation._id}`, pendingForm);
          toast.success("Location updated successfully!");
        } else {
          await axios.post(`${BACKEND_API}/api/locations`, pendingForm);
          toast.success("Location added successfully!");
        }
        fetchLocations();
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
    { field: "name", headerName: "Name", flex: 1, filterable: true },
    { field: "slug", headerName: "Slug", flex: 1, filterable: true },
    {
      field: "city",
      headerName: "City",
      flex: 1,
      valueGetter: (params) => params?.row?.city?.name || "Not specified",
      filterable: true,
    },
    {
      field: "state",
      headerName: "State",
      flex: 1,
      valueGetter: (params) => params?.row?.state?.name || "Not specified",
      filterable: true,
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      valueGetter: (params) => params?.row?.country?.name || "Not specified",
      filterable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params?.row ? (
          <>
            <IconButton onClick={() => handleOpen(params.row)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(params.row._id)}>
              <Delete />
            </IconButton>
          </>
        ) : null,
      width: 120,
    },
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return locations;
    return locations.filter((location) => {
      const s = search.toLowerCase();
      return (
        location.name?.toLowerCase().includes(s) ||
        location.slug?.toLowerCase().includes(s) ||
        location.city?.name?.toLowerCase().includes(s) ||
        location.state?.name?.toLowerCase().includes(s) ||
        location.country?.name?.toLowerCase().includes(s)
      );
    });
  }, [locations, search]);

  // CSV export data
  const csvData = filteredRows.map((location) => ({
    Name: location.name,
    Slug: location.slug,
    City: location.city?.name || "Not specified",
    State: location.state?.name || "Not specified",
    Country: location.country?.name || "Not specified",
  }));

  // PDF export
  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Locations", 14, 10);
    autoTable(doc, {
      head: [["Location", "State", "Country"]],
      body: filteredRows.map((location) => [
        location.name,
        location.state?.name || "",
        location.country?.name || "",
      ]),
    });
    doc.save("locations.pdf");
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        Locations
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Location
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <CSVLink data={csvData} filename="locations.csv" style={{ textDecoration: 'none' }}>
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
        <DialogTitle>
          {editLocation ? "Edit Location" : "Add Location"}
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
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            fullWidth
            margin="normal"
            helperText="Enter a unique identifier for the location (e.g., 'new-york-office', 'london-branch')"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Country *</InputLabel>
            <Select
              value={form.country}
              label="Country *"
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              <MenuItem value="">
                <em>None (Optional)</em>
              </MenuItem>
              {countries.map((country) => (
                <MenuItem key={country._id} value={country._id}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>State *</InputLabel>
            <Select
              value={form.state}
              label="State *"
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            >
              <MenuItem value="">
                <em>None (Optional)</em>
              </MenuItem>
              {states.map((state) => (
                <MenuItem key={state._id} value={state._id}>
                  {state.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>City *</InputLabel>
            <Select
              value={form.city}
              label="City *"
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <MenuItem value="">
                <em>None (Optional)</em>
              </MenuItem>
              {cities.map((city) => (
                <MenuItem key={city._id} value={city._id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 2 }}
          >
            * At least one of Country, State, or City must be specified
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editLocation ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        title={confirmType === "delete" ? "Confirm Delete" : "Confirm Save"}
        content={confirmType === "delete" ? "Are you sure you want to delete this location?" : (editLocation ? "Are you sure you want to update this location?" : "Are you sure you want to add this location?")}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
      />
    </Box>
  );
}

export default LocationPage;
