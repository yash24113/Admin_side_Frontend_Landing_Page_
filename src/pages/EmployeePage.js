import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Download } from "@mui/icons-material";
import axios from "axios";
import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EMPLOYEE_API = `${process.env.ATTENDANCE_BACKEND_API}/employees`;

function EmployeePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
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
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(EMPLOYEE_API);
      setEmployees(res.data);
    } catch (err) {
      setFetchError("Failed to fetch employee data.");
    } finally {
      setIsLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1, filterable: true },
    { field: "_id", headerName: "Employee ID", flex: 1, filterable: true },
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return employees;
    return employees.filter((row) => {
      const s = search.toLowerCase();
      return (
        row.name?.toLowerCase().includes(s) ||
        row._id?.toLowerCase().includes(s)
      );
    });
  }, [employees, search]);

  // CSV export data
  const csvData = filteredRows.map((row) => ({
    Name: row.name,
    "Employee ID": row._id,
  }));

  return (
    <Box className="responsive-container">
      <Typography variant="h6" mb={2}>
        Employees
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
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <CSVLink data={csvData} filename="employees.csv" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" startIcon={<Download />}>Export CSV</Button>
        </CSVLink>
      </Stack>
      <Box sx={{ 
        height: { xs: 350, sm: 400 }, 
        width: "100%",
        '& .MuiDataGrid-root': {
          fontSize: { xs: '12px', sm: '14px' }
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
            rows={filteredRows.map((row, idx) => ({ ...row, id: row._id || idx }))}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={[5, 10, 100]}
            pagination
            components={{ Toolbar: GridToolbar }}
            disableSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                minHeight: { xs: '40px', sm: '56px' }
              },
              '& .MuiDataGrid-cell': {
                minHeight: { xs: '40px', sm: '52px' }
              },
              '& .MuiDataGrid-row': {
                minHeight: { xs: '40px', sm: '52px' }
              }
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default EmployeePage; 
