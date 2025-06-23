import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Download } from "@mui/icons-material";
import api from "../utils/api";
import { CSVLink } from "react-csv";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BACKEND_API = "https://langingpage-production-f27f.up.railway.app";

// Helper function to format datetime
function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export default function InquiryAdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchInquiries = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await api.get(`${BACKEND_API}/api/inquiries`);
      setInquiries(res.data);
    } catch (err) {
      setFetchError("Failed to fetch inquiries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || (user && user.isVerified === false))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    // Debug: log inquiries to check for createdAt
    console.log("Fetched inquiries:", inquiries);
  }, [inquiries]);

  const handleDelete = async (id) => {
    await api.delete(`${BACKEND_API}/api/inquiries/${id}`);
    fetchInquiries();
  };

  const handleEdit = (inquiry) => {
    setEditId(inquiry._id);
    setEditData({ ...inquiry });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    await api.put(`${BACKEND_API}/api/inquiries/${editId}`, editData);
    setEditId(null);
    fetchInquiries();
  };

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      filterable: true,
      editable: false,
      renderCell: (params) =>
        editId === params.row._id ? (
          <TextField
            name="name"
            value={editData.name || ""}
            onChange={handleEditChange}
            size="small"
            variant="standard"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      filterable: true,
      editable: false,
      renderCell: (params) =>
        editId === params.row._id ? (
          <TextField
            name="email"
            value={editData.email || ""}
            onChange={handleEditChange}
            size="small"
            variant="standard"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      filterable: true,
      editable: false,
      renderCell: (params) =>
        editId === params.row._id ? (
          <TextField
            name="phone"
            value={editData.phone || ""}
            onChange={handleEditChange}
            size="small"
            variant="standard"
          />
        ) : (
          params.value
        ),
    },
    {
      field: "message",
      headerName: "Message",
      flex: 2,
      filterable: true,
      editable: false,
      renderCell: (params) =>
        editId === params.row._id ? (
          <TextField
            name="message"
            value={editData.message || ""}
            onChange={handleEditChange}
            size="small"
            variant="standard"
            multiline
            minRows={2}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "createdAt",
      headerName: "createdAt",
      flex: 1,
      filterable: true,
      editable: false,
      renderCell: (params) =>
        editId === params.row._id ? (
          <TextField
            name="message"
            value={editData.createdAt || ""}
            onChange={handleEditChange}
            size="small"
            variant="standard"
            multiline
            minRows={2}
          />
        ) : (
          params.value
        ),
    },

    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          {editId === params.row._id ? (
            <>
              <Button onClick={handleEditSave} color="primary">
                Save
              </Button>
              <Button onClick={() => setEditId(null)} color="secondary">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <IconButton
                onClick={() => handleEdit(params.row)}
                aria-label="edit"
              >
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(params.row._id)}
                aria-label="delete"
              >
                <Delete />
              </IconButton>
            </>
          )}
        </>
      ),
      width: 160,
    },
  ];

  // Filtering/search logic
  const filteredRows = useMemo(() => {
    if (!search) return inquiries;
    return inquiries.filter((inq) => {
      const s = search.toLowerCase();
      return (
        inq.name?.toLowerCase().includes(s) ||
        inq.email?.toLowerCase().includes(s) ||
        inq.phone?.toLowerCase().includes(s) ||
        inq.message?.toLowerCase().includes(s)
      );
    });
  }, [inquiries, search]);

  // CSV export data
  const csvData = filteredRows.map((inq) => ({
    Name: inq.name,
    Email: inq.email,
    Phone: inq.phone,
    Message: inq.message,
    "Created At": formatDateTime(inq.createdAt),
  }));

  // PDF export
  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Inquiries", 14, 10);
    autoTable(doc, {
      head: [["Name", "Email", "Phone", "Message", "CreateAt"]],
      body: filteredRows.map((inquiry) => [
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.message,
        inquiry.createdAt,
      ]),
    });
    doc.save("inquiries.pdf");
  };

  return (
    <>
      <Box p={3}>
        <Typography variant="h6" mb={2}>
          Business Inquiry
        </Typography>
        <Stack direction="row" spacing={2} mb={2}>
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
            filename="inquiries.csv"
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
      </Box>
    </>
  );
}
