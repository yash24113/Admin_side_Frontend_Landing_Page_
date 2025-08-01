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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Download } from "@mui/icons-material";
import axios from "axios";
import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VIEW_API = `${process.env.ATTENDANCE_BACKEND_API}/attendance`;
const ADD_API = `${process.env.ATTENDANCE_BACKEND_API}/api/attendance`;


function AttendancePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    type: "Checkin",
    date: "",
    time: "",
    location: "",
    office: "",
    selfie: "",
  });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user && user.isVerified === false))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(VIEW_API);
      setAttendance(res.data);
    } catch (err) {
      setFetchError("Failed to fetch attendance data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setForm({
      employee: "",
      type: "Checkin",
      date: "",
      time: "",
      location: "",
      office: "",
      selfie: "",
    });
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({
      employee: "",
      type: "Checkin",
      date: "",
      time: "",
      location: "",
      office: "",
      selfie: "",
    });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.employee || !form.date || !form.time || !form.location || !form.office) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      const payload = { ...form };
      await axios.post(ADD_API, payload);
      toast.success("Attendance added successfully");
      handleClose();
      fetchAttendance();
    } catch (err) {
      setError("Failed to add attendance.");
    }
  };

  // DataGrid columns
  const columns = [
    { 
      field: "employee", 
      headerName: "Employee", 
      flex: 1.5, 
      minWidth: 120,
      filterable: true,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          width: '100%',
          paddingRight: '8px'
        }}>
          {params.value}
        </div>
      )
    },
    { 
      field: "type", 
      headerName: "Type", 
      flex: 1, 
      minWidth: 100,
      filterable: true 
    },
    { 
      field: "date", 
      headerName: "Date", 
      flex: 1.2, 
      minWidth: 110,
      filterable: true,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          width: '100%'
        }}>
          {params.value}
        </div>
      )
    },
    { 
      field: "time", 
      headerName: "Time", 
      flex: 1, 
      minWidth: 80,
      filterable: true,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          width: '100%'
        }}>
          {params.value}
        </div>
      )
    },
    { 
      field: "location", 
      headerName: "Location", 
      flex: 2, 
      minWidth: 150,
      filterable: true,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          width: '100%',
          paddingRight: '8px'
        }}>
          {params.value}
        </div>
      )
    },
    { 
      field: "office", 
      headerName: "Office", 
      flex: 1.5, 
      minWidth: 120,
      filterable: true,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          width: '100%'
        }}>
          {params.value}
        </div>
      )
    },
    {
      field: "selfie",
      headerName: "Selfie",
      flex: 1,
      minWidth: 80,
      renderCell: (params) =>
        params.value ? (
          <img src={params.value} alt="selfie" style={{ width: 40, height: 40, borderRadius: 4 }} />
        ) : (
          "-"
        ),
      sortable: false,
      filterable: false,
    },
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return attendance;
    return attendance.filter((row) => {
      const s = search.toLowerCase();
      return (
        row.employee?.toLowerCase().includes(s) ||
        row.type?.toLowerCase().includes(s) ||
        row.date?.toLowerCase().includes(s) ||
        row.time?.toLowerCase().includes(s) ||
        row.location?.toLowerCase().includes(s) ||
        row.office?.toLowerCase().includes(s)
      );
    });
  }, [attendance, search]);

  // CSV export data
  const csvData = filteredRows.map((row) => ({
    Employee: row.employee,
    Type: row.type,
    Date: row.date,
    Time: row.time,
    Location: row.location,
    Office: row.office,
    Selfie: row.selfie,
  }));

  return (
    <Box className="responsive-container">
      <Typography variant="h6" mb={2}>
        Attendance
      </Typography>
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        spacing={2} 
        mb={2}
        sx={{
          '& .MuiButton-root': {
            minWidth: { xs: '100%', sm: 'auto' }
          },
          '& .MuiTextField-root': {
            minWidth: { xs: '100%', sm: '200px' }
          }
        }}
      >
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Attendance
        </Button>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <CSVLink data={csvData} filename="attendance.csv" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<Download />}>Export CSV</Button>
        </CSVLink>
      </Stack>
      <Box sx={{ 
        height: { xs: 350, sm: 400 }, 
        width: "100%",
        overflow: 'auto',
        '& .MuiDataGrid-root': {
          fontSize: { xs: '12px', sm: '14px' }
        },
        '& .MuiDataGrid-virtualScroller': {
          overflow: 'auto !important'
        },
        '& .MuiDataGrid-virtualScrollerContent': {
          minWidth: 'max-content'
        }
      }}>
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
            rows={filteredRows.map((row, idx) => ({ ...row, id: idx }))}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={[5, 10,100]}
            pagination
            components={{ Toolbar: GridToolbar }}
            disableSelectionOnClick
            autoHeight
            columnBuffer={2}
            columnThreshold={2}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                minHeight: { xs: '40px', sm: '56px' }
              },
              '& .MuiDataGrid-cell': {
                minHeight: { xs: '40px', sm: '52px' },
                padding: { xs: '4px 8px', sm: '8px 16px' }
              },
              '& .MuiDataGrid-row': {
                minHeight: { xs: '40px', sm: '52px' }
              },
              '& .MuiDataGrid-columnHeader': {
                padding: { xs: '4px 8px', sm: '8px 16px' }
              },
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto !important'
              },
              '& .MuiDataGrid-virtualScrollerContent': {
                minWidth: 'max-content'
              }
            }}
          />
        )}
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Attendance</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Employee"
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={form.type}
              label="Type"
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <MenuItem value="Checkin">Checkin</MenuItem>
              <MenuItem value="Checkout">Checkout</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Office"
            value={form.office}
            onChange={(e) => setForm({ ...form, office: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Selfie URL"
            value={form.selfie}
            onChange={(e) => setForm({ ...form, selfie: e.target.value })}
            fullWidth
            margin="normal"
            helperText="Paste selfie image URL (optional)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AttendancePage; 
