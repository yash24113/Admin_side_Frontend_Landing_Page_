import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  ExpandMore,
  Label,
  Link as LinkIcon,
  Tag,
  Info,
  CalendarToday,
  Star,
  Person,
  Public,
  ShoppingCart,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BACKEND_API = "https://langingpage-production-f27f.up.railway.app";

function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

const initialForm = {
  sku: "",
  slug: "",
  locationId: "",
  productId: "",
  charset: "",
  xUaCompatible: "",
  viewport: "",
  title: "",
  description: "",
  keywords: "",
  robots: "",
  contentLanguage: "",
  googleSiteVerification: "",
  msValidate: "",
  themeColor: "",
  mobileWebAppCapable: false,
  appleStatusBarStyle: "",
  formatDetection: "",
  ogLocale: "",
  ogTitle: "",
  ogDescription: "",
  ogType: "",
  ogUrl: "",
  ogSiteName: "",
  twitterCard: "",
  twitterSite: "",
  twitterTitle: "",
  twitterDescription: "",
  hreflang: "",
  x_default: "",
  author_name: "",
  excerpt: "",
  canonical_url: "",
  description_html: "",
  rating_value: "",
  rating_count: "",
  publishedAt: "",
  seo_custom_fields: undefined,
  custom: {},
};

function SEOPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [seos, setSEOs] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editSEO, setEditSEO] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newDropdownSource, setNewDropdownSource] = useState("");

  const fetchSEOs = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/seos`);
      setSEOs(res.data);
      localStorage.setItem("seos_cache", JSON.stringify(res.data));
    } catch (err) {
      setFetchError("Failed to fetch SEO entries.");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchProducts = async () => {
    const res = await axios.get(`${BACKEND_API}/api/products`);
    setProducts(res.data);
  };
  const fetchLocations = async () => {
    const res = await axios.get(`${BACKEND_API}/api/locations`);
    setLocations(res.data);
  };

  const fetchCustomFields = async () => {
    try {
      const res = await axios.get(`${BACKEND_API}/api/seo-custom-fields`);
      setCustomFields(res.data);
    } catch {
      setCustomFields([]);
    }
  };

  useEffect(() => {
    if (!loading && (!user || (user && user.isVerified === false))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Try to load cached SEO entries from localStorage for instant render
    const cached = localStorage.getItem("seos_cache");
    if (cached) {
      try {
        setSEOs(JSON.parse(cached));
        setIsLoading(false); // Show cached data instantly
      } catch (e) {
        // Ignore parse errors
      }
    }
    fetchSEOs(); // Always fetch fresh data in background
    fetchProducts();
    fetchLocations();
    fetchCustomFields();
  }, []);

  const handleOpen = (seo = null) => {
    let baseForm = seo
      ? {
          ...seo,
          publishedAt: seo.publishedAt ? seo.publishedAt.slice(0, 16) : "",
          custom: seo.custom || {},
        }
      : { ...initialForm, custom: {} };
    setEditSEO(seo);
    setForm(baseForm);
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditSEO(null);
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      if (!isValidSlug(form.slug)) {
        setError(
          "Slug can only contain lowercase letters, numbers, and hyphens. No spaces or other characters allowed."
        );
        toast.error("Invalid slug format.");
        return;
      }
      if (!form.sku || !form.slug || !form.locationId || !form.productId) {
        setError("SKU, Slug, LocationId, and ProductId are required.");
        toast.error("SKU, Slug, LocationId, and ProductId are required.");
        return;
      }
      const payload = { ...form };
      if (payload.publishedAt === "") delete payload.publishedAt;
      if (editSEO) {
        await axios.put(`${BACKEND_API}/api/seos/${editSEO._id}`, payload);
        toast.success("SEO entry updated successfully!");
      } else {
        await axios.post(`${BACKEND_API}/api/seos`, payload);
        toast.success("SEO entry added successfully!");
      }
      fetchSEOs();
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
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BACKEND_API}/api/seos/${id}`);
    fetchSEOs();
    toast.success("SEO entry deleted successfully!");
  };

  const handleExportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("SEO Entries", 14, 10);
    autoTable(doc, {
      head: [["SKU", "Slug", "Location", "Product"]],
      body: seos.map((seo) => [
        seo.sku,
        seo.slug,
        seo.locationId,
        seo.productId,
      ]),
    });
    doc.save("seos.pdf");
  };

  const fetchDropdownOptions = async (source) => {
    let url = null;
    switch (source) {
      case "Country":
        url = `${BACKEND_API}/api/countries`;
        break;
      case "State":
        url = `${BACKEND_API}/api/states`;
        break;
      case "City":
        url = `${BACKEND_API}/api/cities`;
        break;
      case "Location":
        url = `${BACKEND_API}/api/locations`;
        break;
      case "Product":
        url = `${BACKEND_API}/api/products`;
        break;
      default:
        return [];
    }
    try {
      const res = await axios.get(url);
      return res.data;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      const newDropdownOptions = {};
      for (const field of customFields) {
        if (field.type === "dropdown" && field.dropdownSource) {
          newDropdownOptions[field.name] = await fetchDropdownOptions(field.dropdownSource);
        }
      }
      setDropdownOptions(newDropdownOptions);
    })();
  }, [customFields]);

  const handleAddCustomField = async () => {
    if (!newFieldName.trim() || customFields.some(f => f.name === newFieldName.trim())) return;
    if (newFieldType === "dropdown" && !newDropdownSource) return;
    try {
      const payload = newFieldType === "dropdown"
        ? { name: newFieldName.trim(), type: newFieldType, dropdownSource: newDropdownSource }
        : { name: newFieldName.trim(), type: newFieldType };
        await axios.post(`${BACKEND_API}/api/seo-custom-fields`, payload);
      fetchCustomFields();
      setNewFieldName("");
      setNewFieldType("text");
      setNewDropdownSource("");
    } catch (err) {
      // Optionally show error
    }
  };

  const handleDeleteCustomField = async idx => {
    const field = customFields[idx];
    try {
      await axios.delete(`${BACKEND_API}/api/seo-custom-fields/${field._id}`);
      fetchCustomFields();
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" mb={2}>
        SEO Entries
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Add SEO Entry
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setSettingsOpen(true)}
        sx={{ mb: 2, ml: 2 }}
      >
        Settings
      </Button>
      <Box sx={{ height: 400, width: "100%" }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : fetchError ? (
          <Alert severity="error">{fetchError}</Alert>
        ) : seos.length === 0 ? (
          <Alert severity="info">No data found.</Alert>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {seos.map((seo) => (
              <Card
                key={seo._id}
                sx={{
                  borderRadius: 3,
                  boxShadow: 6,
                  minHeight: 420,
                  width: "100%",
                  maxWidth: 1000,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  mb: 4,
                  p: 0,
                  background: "#fafaff",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    width: "100%",
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#fff",
                      color: "#764ba2",
                      fontWeight: 700,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {seo.title?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                  <Box>
                    <Tooltip title={seo.title || ""}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {seo.title || "No Title"}
                      </Typography>
                    </Tooltip>
                    <Tooltip title={seo.slug}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                        noWrap
                      >
                        <Label fontSize="small" />
                        {seo.slug}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
                <CardContent sx={{ width: "100%", pt: 2, pb: 1 }}>
                  {/* Primary Details Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Info sx={{ mr: 1 }} color="primary" />
                      <Typography variant="subtitle1" fontWeight={700}>Primary Details</Typography>
                    </Box>
                    <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap">
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 160, mr: 2, mb: 1 }}>
                        <ShoppingCart fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Product:</Typography>
                        <Typography variant="body2">
                          {products.find((p) => p._id === seo.productId)?.name || seo.productId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 160, mr: 2, mb: 1 }}>
                        <Public fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Location:</Typography>
                        <Typography variant="body2">
                          {locations.find((l) => l._id === seo.locationId)?.name || seo.locationId}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>SKU:</Typography>
                        <Typography variant="body2">{seo.sku}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Star fontSize="small" color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Rating:</Typography>
                        <Typography variant="body2">{seo.rating_value} ({seo.rating_count})</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <CalendarToday fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Published:</Typography>
                        <Typography variant="body2">
                          {seo.publishedAt ? new Date(seo.publishedAt).toLocaleDateString() : "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Person fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Author:</Typography>
                        <Typography variant="body2">{seo.author_name || "—"}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  {/* Secondary Details Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Label sx={{ mr: 1 }} color="secondary" />
                      <Typography variant="subtitle1" fontWeight={700}>Secondary Details</Typography>
                    </Box>
                    <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap" justifyContent="flex-start">
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Robots:</Typography>
                        <Typography variant="body2">{seo.robots}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Charset:</Typography>
                        <Typography variant="body2">{seo.charset}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>x-ua-compatible:</Typography>
                        <Typography variant="body2">{seo.xUaCompatible}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Viewport:</Typography>
                        <Typography variant="body2">{seo.viewport}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Public fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Content Language:</Typography>
                        <Typography variant="body2">{seo.contentLanguage}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Google Site Verification:</Typography>
                        <Typography variant="body2">{seo.googleSiteVerification}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>MS Validate:</Typography>
                        <Typography variant="body2">{seo.msValidate}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Theme Color:</Typography>
                        <Typography variant="body2">{seo.themeColor}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Mobile Web App Capable:</Typography>
                        <Typography variant="body2">{seo.mobileWebAppCapable ? "Yes" : "No"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Apple Status Bar Style:</Typography>
                        <Typography variant="body2">{seo.appleStatusBarStyle}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Format Detection:</Typography>
                        <Typography variant="body2">{seo.formatDetection}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Public fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>OG Locale:</Typography>
                        <Typography variant="body2">{seo.ogLocale}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>OG Title:</Typography>
                        <Typography variant="body2">{seo.ogTitle}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>OG Description:</Typography>
                        <Typography variant="body2">{seo.ogDescription}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>OG Type:</Typography>
                        <Typography variant="body2">{seo.ogType}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <LinkIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>OG URL:</Typography>
                        <Typography variant="body2">{seo.ogUrl}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>OG Site Name:</Typography>
                        <Typography variant="body2">{seo.ogSiteName}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Tag fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Twitter Card:</Typography>
                        <Typography variant="body2">{seo.twitterCard}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Twitter Site:</Typography>
                        <Typography variant="body2">{seo.twitterSite}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Label fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Twitter Title:</Typography>
                        <Typography variant="body2">{seo.twitterTitle}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Twitter Description:</Typography>
                        <Typography variant="body2">{seo.twitterDescription}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Public fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Hreflang:</Typography>
                        <Typography variant="body2">{seo.hreflang}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>x-default:</Typography>
                        <Typography variant="body2">{seo.x_default}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 120, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Excerpt:</Typography>
                        <Typography variant="body2">{seo.excerpt}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 200, mr: 2, mb: 1 }}>
                        <Info fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ mr: 0.5 }}>Description HTML:</Typography>
                        {seo.description_html ? (
                          <Box
                            sx={{ background: "#f5f5f5", p: 1, borderRadius: 1 }}
                            dangerouslySetInnerHTML={{ __html: seo.description_html }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                  {/* Custom Fields Section */}
                  {customFields.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={700}>Custom Fields</Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        {customFields.map((field, idx) => {
                          let displayValue = "-";
                          if (field.type === 'dropdown' && dropdownOptions[field.name]) {
                            const options = field.name === 'Country' && dropdownOptions['Country'] ? dropdownOptions['Country'] : dropdownOptions[field.name];
                            const found = options && options.find(
                              opt => String(opt._id || opt.id || opt.name) === String(seo.custom?.[field.name])
                            );
                            if (found) displayValue = found.name;
                          } else if (seo.custom && seo.custom[field.name] !== undefined) {
                            displayValue = String(seo.custom[field.name]);
                          }
                          return (
                            <Box
                              key={field.name}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                background: "linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%)",
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                boxShadow: 1,
                                minWidth: 100,
                                mr: 2,
                                mb: 1,
                              }}
                            >
                              <Tag fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" fontWeight={600} sx={{ color: '#764ba2', mr: 0.5 }}>
                                {field.name}:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#222' }}>{displayValue}</Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "flex-end", p: 2, width: "100%" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpen(seo)}
                    startIcon={<Edit />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(seo._id)}
                    startIcon={<Delete />}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editSEO ? "Edit SEO Entry" : "Add SEO Entry"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Only lowercase letters, numbers, and hyphens allowed."
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Location</InputLabel>
            <Select
              value={form.locationId}
              label="Location"
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
            >
              {locations.map((location) => (
                <MenuItem key={location._id} value={location._id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Product</InputLabel>
            <Select
              value={form.productId}
              label="Product"
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Country</InputLabel>
            <Select
              value={form.countryId || ""}
              label="Country"
              onChange={e => setForm({ ...form, countryId: e.target.value })}
            >
              {(dropdownOptions['Country'] || []).map(country => (
                <MenuItem key={country._id || country.id || country.name} value={country._id || country.id || country.name}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Charset"
            value={form.charset}
            onChange={(e) => setForm({ ...form, charset: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="x-ua-compatible"
            value={form.xUaCompatible}
            onChange={(e) =>
              setForm({ ...form, xUaCompatible: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Viewport"
            value={form.viewport}
            onChange={(e) => setForm({ ...form, viewport: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Keywords"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Robots"
            value={form.robots}
            onChange={(e) => setForm({ ...form, robots: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content Language"
            value={form.contentLanguage}
            onChange={(e) =>
              setForm({ ...form, contentLanguage: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Google Site Verification"
            value={form.googleSiteVerification}
            onChange={(e) =>
              setForm({ ...form, googleSiteVerification: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="MS Validate"
            value={form.msValidate}
            onChange={(e) => setForm({ ...form, msValidate: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Theme Color"
            value={form.themeColor}
            onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mobile Web App Capable"
            value={form.mobileWebAppCapable ? "true" : "false"}
            onChange={(e) =>
              setForm({
                ...form,
                mobileWebAppCapable: e.target.value === " true",
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Apple Status Bar Style"
            value={form.appleStatusBarStyle}
            onChange={(e) =>
              setForm({ ...form, appleStatusBarStyle: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Format Detection"
            value={form.formatDetection}
            onChange={(e) =>
              setForm({ ...form, formatDetection: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="OG Locale"
            value={form.ogLocale}
            onChange={(e) => setForm({ ...form, ogLocale: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="OG Title"
            value={form.ogTitle}
            onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="OG Description"
            value={form.ogDescription}
            onChange={(e) =>
              setForm({ ...form, ogDescription: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="OG Type"
            value={form.ogType}
            onChange={(e) => setForm({ ...form, ogType: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="OG URL"
            value={form.ogUrl}
            onChange={(e) => setForm({ ...form, ogUrl: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="OG Site Name"
            value={form.ogSiteName}
            onChange={(e) => setForm({ ...form, ogSiteName: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Twitter Card"
            value={form.twitterCard}
            onChange={(e) => setForm({ ...form, twitterCard: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Twitter Site"
            value={form.twitterSite}
            onChange={(e) => setForm({ ...form, twitterSite: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Twitter Title"
            value={form.twitterTitle}
            onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Twitter Description"
            value={form.twitterDescription}
            onChange={(e) =>
              setForm({ ...form, twitterDescription: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Hreflang"
            value={form.hreflang}
            onChange={(e) => setForm({ ...form, hreflang: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="x-default"
            value={form.x_default}
            onChange={(e) => setForm({ ...form, x_default: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Canonical URL"
            value={form.canonical_url}
            onChange={(e) =>
              setForm({ ...form, canonical_url: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description HTML"
            value={form.description_html}
            onChange={(e) =>
              setForm({ ...form, description_html: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Rating Value"
            type="number"
            value={form.rating_value}
            onChange={(e) => setForm({ ...form, rating_value: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Rating Count"
            type="number"
            value={form.rating_count}
            onChange={(e) => setForm({ ...form, rating_count: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Published At"
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          {customFields.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Custom Fields
              </Typography>
              <Grid container spacing={2}>
                {customFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field.name}>
                    {field.type === "dropdown" ? (
                      <FormControl fullWidth margin="normal">
                        <InputLabel>{field.name}</InputLabel>
                        <Select
                          value={form.custom?.[field.name] ?? ""}
                          label={field.name}
                          onChange={e =>
                            setForm({
                              ...form,
                              custom: {
                                ...form.custom,
                                [field.name]: e.target.value
                              }
                            })
                          }
                        >
                          {(dropdownOptions[field.name] || []).map(option => (
                            <MenuItem key={option._id || option.id || option.name} value={option._id || option.id || option.name}>
                              {option.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        label={field.name}
                        type={field.type === "number" ? "number" : "text"}
                        value={form.custom?.[field.name] ?? ""}
                        onChange={e =>
                          setForm({
                            ...form,
                            custom: {
                              ...form.custom,
                              [field.name]: field.type === "number"
                                ? e.target.value.replace(/[^0-9.]/g, "")
                                : e.target.value
                            }
                          })
                        }
                        fullWidth
                        margin="normal"
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editSEO ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Custom Fields Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Add New Field</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <TextField
                label="Field Name"
                value={newFieldName}
                onChange={e => setNewFieldName(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={newFieldType}
                  label="Field Type"
                  onChange={e => setNewFieldType(e.target.value)}
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="dropdown">Dropdown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {newFieldType === "dropdown" && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Dropdown Source</InputLabel>
                  <Select
                    value={newDropdownSource}
                    label="Dropdown Source"
                    onChange={e => setNewDropdownSource(e.target.value)}
                  >
                    <MenuItem value="Country">Country</MenuItem>
                    <MenuItem value="State">State</MenuItem>
                    <MenuItem value="City">City</MenuItem>
                    <MenuItem value="Location">Location</MenuItem>
                    <MenuItem value="Product">Product</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
          <Button
            sx={{ mt: 1, mb: 2 }}
            variant="contained"
            onClick={handleAddCustomField}
          >
            Add Field
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Custom Fields</Typography>
          <Box sx={{ maxHeight: 300, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 4 }}>Name</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 4 }}>Type</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 4 }}>Dropdown Source</th>
                  <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: 4 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customFields.map((field, idx) => (
                  <tr key={field.name}>
                    <td style={{ padding: 4 }}>{field.name || '-'}</td>
                    <td style={{ padding: 4 }}>{field.type ? field.type.charAt(0).toUpperCase() + field.type.slice(1) : '-'}</td>
                    <td style={{ padding: 4 }}>{field.type === 'dropdown' ? (field.dropdownSource || '-') : '-'}</td>
                    <td style={{ padding: 4 }}>
                      <Button
                        color="error"
                        size="small"
                        onClick={() => handleDeleteCustomField(idx)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SEOPage;
