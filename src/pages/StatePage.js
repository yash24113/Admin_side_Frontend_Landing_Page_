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

function StatePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [open, setOpen] = useState(false);
  const [editState, setEditState] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", country: "" });
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
    // Try to load cached states from localStorage for instant render
    const cached = localStorage.getItem("states_cache");
    if (cached) {
      try {
        setStates(JSON.parse(cached));
        setIsLoading(false); // Show cached data instantly
      } catch (e) {
        // Ignore parse errors
      }
    }
    fetchStates(); // Always fetch fresh data in background
    fetchCountries();
  }, []);

  const fetchStates = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/states`);
      setStates(res.data);
      localStorage.setItem("states_cache", JSON.stringify(res.data)); // Cache for ISR
    } catch (err) {
      setFetchError("Failed to fetch states.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchCountries = async () => {
    const res = await axios.get(`${BACKEND_API}/api/countries`);
    setCountries(res.data);
  };

  const handleOpen = (state = null) => {
    setEditState(state);
    setForm(
      state
        ? {
            name: state.name,
            code: state.code,
            country: state.country?._id || state.country || "",
          }
        : { name: "", code: "", country: "" }
    );
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditState(null);
    setForm({ name: "", code: "", country: "" });
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
        await axios.delete(`${BACKEND_API}/api/states/${pendingId}`);
        fetchStates();
        toast.success("State deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err, err.response?.data);
        toast.error("Failed to delete state.");
      }
      setPendingId(null);
    } else if (confirmType === "update") {
      try {
        console.log("Submitting form:", pendingForm);
        if (editState) {
          await axios.put(`${BACKEND_API}/api/states/${editState._id}`, pendingForm);
          toast.success("State updated successfully!");
        } else {
          await axios.post(`${BACKEND_API}/api/states`, pendingForm);
          toast.success("State added successfully!");
        }
        fetchStates();
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

  // Helper to always get the country object from a state (handles both populated and ID cases)
  const getCountryObj = (state) => {
    if (!state || !state.country) return {};
    if (typeof state.country === "object" && state.country.name)
      return state.country;
    // If country is an ID, find the country object
    return countries.find((c) => c._id === state.country) || {};
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "State", flex: 1, filterable: true },
    { field: "code", headerName: "Code", flex: 1, filterable: true },
    {
      field: "countryName",
      headerName: "Country",
      flex: 1,
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
    if (!search) return states;
    return states.filter((state) => {
      const s = search.toLowerCase();
      const countryObj = getCountryObj(state);
      return (
        state.name?.toLowerCase().includes(s) ||
        state.code?.toLowerCase().includes(s) ||
        countryObj.name?.toLowerCase().includes(s)
      );
    });
  }, [states, search, countries]);

  // CSV export data
  const csvData = filteredRows.map((state) => ({
    State: state.name,
    Code: state.code,
    Country: getCountryObj(state).name || "",
  }));

  // PDF export
  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("States", 14, 10);
    autoTable(doc, {
      head: [["State", "Country"]],
      body: filteredRows.map((state) => [
        state.name,
        getCountryObj(state).name || "",
      ]),
    });
    doc.save("states.pdf");
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        States
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add State
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <CSVLink data={csvData} filename="states.csv" style={{ textDecoration: 'none' }}>
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
            rows={filteredRows.map((row) => ({
              ...row,
              id: row._id,
              countryName: getCountryObj(row).name || "",
            }))}
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
        <DialogTitle>{editState ? "Edit State" : "Add State"}</DialogTitle>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Country</InputLabel>
            <Select
              value={form.country}
              label="Country"
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              {countries.map((country) => (
                <MenuItem key={country._id} value={country._id}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editState ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        title={confirmType === "delete" ? "Confirm Delete" : "Confirm Save"}
        content={confirmType === "delete" ? "Are you sure you want to delete this state?" : (editState ? "Are you sure you want to update this state?" : "Are you sure you want to add this state?")}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
      />
    </Box>
  );
}

export default StatePage;
