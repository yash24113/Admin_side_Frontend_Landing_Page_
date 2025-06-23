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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Download } from "@mui/icons-material";
import axios from "axios";
import { CSVLink } from "react-csv";

const BACKEND_API = "https://langingpage-production-f27f.up.railway.app";

function CityPage() {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [open, setOpen] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [form, setForm] = useState({ name: "", country: "", state: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(3);

  const fetchCities = async () => {
    const res = await axios.get(`${BACKEND_API}/api/cities`);
    const cleaned = res.data.map((city) => ({
      ...city,
      state: city.state || null,
      country: city.country || null,
    }));
    setCities(cleaned);
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
    fetchCities();
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
    try {
      if (editCity) {
        await axios.put(`${BACKEND_API}/api/cities/${editCity._id}`, form);
      } else {
        await axios.post(`${BACKEND_API}/api/cities`, form);
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
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/cities/${id}`);
    fetchCities();
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
      <Stack direction="row" spacing={2} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add City
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
          filename="cities.csv"
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
          <Button onClick={handleSubmit} variant="contained">
            {editCity ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CityPage;
