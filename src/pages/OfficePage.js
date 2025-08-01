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

const OFFICE_API = `${process.env.ATTENDANCE_BACKEND_API}/offices`;

function OfficePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
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
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(OFFICE_API);
      setOffices(res.data);
    } catch (err) {
      setFetchError("Failed to fetch office data.");
    } finally {
      setIsLoading(false);
    }
  };

  // DataGrid columns
  const columns = [
    { 
      field: "officename", 
      headerName: "Office Name", 
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
      field: "latitude", 
      headerName: "Latitude", 
      flex: 1.2, 
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
      field: "longitude", 
      headerName: "Longitude", 
      flex: 1.2, 
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
      field: "_id", 
      headerName: "Office ID", 
      flex: 1.5, 
      minWidth: 140,
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
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return offices;
    return offices.filter((row) => {
      const s = search.toLowerCase();
      return (
        row.officename?.toLowerCase().includes(s) ||
        String(row.latitude).toLowerCase().includes(s) ||
        String(row.longitude).toLowerCase().includes(s) ||
        row._id?.toLowerCase().includes(s)
      );
    });
  }, [offices, search]);

  // CSV export data
  const csvData = filteredRows.map((row) => ({
    "Office Name": row.officename,
    Latitude: row.latitude,
    Longitude: row.longitude,
    "Office ID": row._id,
  }));

  return (
    <Box className="responsive-container">
      <Typography variant="h6" mb={2}>
        Offices
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
        <CSVLink data={csvData} filename="offices.csv" style={{ textDecoration: 'none' }}>
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
            rows={filteredRows.map((row, idx) => ({ ...row, id: row._id || idx }))}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={[5, 10, 100]}
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
    </Box>
  );
}

export default OfficePage; 
