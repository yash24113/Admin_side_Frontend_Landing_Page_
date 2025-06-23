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

  const fetchSEOs = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${BACKEND_API}/api/seos`);
      setSEOs(res.data);
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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchSEOs();
    fetchProducts();
    fetchLocations();
  }, []);

  const handleOpen = (seo = null) => {
    setEditSEO(seo);
    setForm(
      seo
        ? {
            ...seo,
            publishedAt: seo.publishedAt ? seo.publishedAt.slice(0, 16) : "",
          }
        : initialForm
    );
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
        return;
      }
      if (!form.sku || !form.slug || !form.locationId || !form.productId) {
        setError("SKU, Slug, LocationId, and ProductId are required.");
        return;
      }
      const payload = { ...form };
      if (payload.publishedAt === "") delete payload.publishedAt;
      if (editSEO) {
        await axios.put(`${BACKEND_API}/api/seos/${editSEO._id}`, payload);
      } else {
        await axios.post(`${BACKEND_API}/api/seos`, payload);
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
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BACKEND_API}/api/seos/${id}`);
    fetchSEOs();
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
                  boxShadow: 4,
                  minHeight: 420,
                  width: "100%",
                  maxWidth: 540,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  mb: 4,
                  p: 0,
                }}
              >
                {/* Top header */}
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
                  <Stack spacing={1} divider={<Divider flexItem />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ShoppingCart fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={500}>
                        Product:
                      </Typography>
                      <Typography variant="body2">
                        {products.find((p) => p._id === seo.productId)?.name ||
                          seo.productId}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Public fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={500}>
                        Location:
                      </Typography>
                      <Typography variant="body2">
                        {locations.find((l) => l._id === seo.locationId)?.name ||
                          seo.locationId}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Info fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={500}>
                        SKU:
                      </Typography>
                      <Typography variant="body2">{seo.sku}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Star fontSize="small" color="warning" />
                      <Typography variant="body2" fontWeight={500}>
                        Rating:
                      </Typography>
                      <Typography variant="body2">
                        {seo.rating_value} ({seo.rating_count})
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={500}>
                        Published:
                      </Typography>
                      <Typography variant="body2">
                        {seo.publishedAt
                          ? new Date(seo.publishedAt).toLocaleDateString()
                          : "-"}
                      </Typography>
                    </Stack>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                        Description:
                      </Typography>
                      <Typography variant="body2">
                        {seo.description || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                        Keywords:
                      </Typography>
                      {seo.keywords ? (
                        seo.keywords
                          .split(",")
                          .map((kw, i) => (
                            <Chip
                              key={i}
                              label={kw.trim()}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                              color="secondary"
                            />
                          ))
                      ) : (
                        <Chip label="No keywords" size="small" />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                        Canonical URL:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <a
                          href={seo.canonical_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkIcon
                            fontSize="inherit"
                            sx={{ verticalAlign: "middle" }}
                          />{" "}
                          {seo.canonical_url}
                        </a>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                        Author:
                      </Typography>
                      <Typography variant="body2">{seo.author_name}</Typography>
                    </Box>
                    <Accordion
                      sx={{ boxShadow: "none", background: "transparent", mt: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" fontWeight={700}>
                          Meta & Advanced
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            <b>Robots:</b> {seo.robots}
                          </Typography>
                          <Typography variant="body2">
                            <b>Charset:</b> {seo.charset}
                          </Typography>
                          <Typography variant="body2">
                            <b>x-ua-compatible:</b> {seo.xUaCompatible}
                          </Typography>
                          <Typography variant="body2">
                            <b>Viewport:</b> {seo.viewport}
                          </Typography>
                          <Typography variant="body2">
                            <b>Content Language:</b> {seo.contentLanguage}
                          </Typography>
                          <Typography variant="body2">
                            <b>Google Site Verification:</b>{" "}
                            {seo.googleSiteVerification}
                          </Typography>
                          <Typography variant="body2">
                            <b>MS Validate:</b> {seo.msValidate}
                          </Typography>
                          <Typography variant="body2">
                            <b>Theme Color:</b> {seo.themeColor}
                          </Typography>
                          <Typography variant="body2">
                            <b>Mobile Web App Capable:</b>{" "}
                            {seo.mobileWebAppCapable ? "Yes" : "No"}
                          </Typography>
                          <Typography variant="body2">
                            <b>Apple Status Bar Style:</b> {seo.appleStatusBarStyle}
                          </Typography>
                          <Typography variant="body2">
                            <b>Format Detection:</b> {seo.formatDetection}
                          </Typography>
                          <Typography variant="body2">
                            <b>OG Locale:</b> {seo.ogLocale}
                          </Typography>
                          <Typography variant="body2">
                            <b>OG Title:</b> {seo.ogTitle}
                          </Typography>
                          <Typography variant="body2">
                            <b>OG Description:</b> {seo.ogDescription}
                          </Typography>
                          <Typography variant="body2">
                            <b>OG Type:</b> {seo.ogType}
                          </Typography>
                          <Typography variant="body2">
                            <b>OG URL:</b> {seo.ogUrl}
                          </Typography>
                          <Typography variant="body2">
                            <b>OG Site Name:</b> {seo.ogSiteName}
                          </Typography>
                          <Typography variant="body2">
                            <b>Twitter Card:</b> {seo.twitterCard}
                          </Typography>
                          <Typography variant="body2">
                            <b>Twitter Site:</b> {seo.twitterSite}
                          </Typography>
                          <Typography variant="body2">
                            <b>Twitter Title:</b> {seo.twitterTitle}
                          </Typography>
                          <Typography variant="body2">
                            <b>Twitter Description:</b> {seo.twitterDescription}
                          </Typography>
                          <Typography variant="body2">
                            <b>Hreflang:</b> {seo.hreflang}
                          </Typography>
                          <Typography variant="body2">
                            <b>x-default:</b> {seo.x_default}
                          </Typography>
                          <Typography variant="body2">
                            <b>Excerpt:</b> {seo.excerpt}
                          </Typography>
                          <Typography variant="body2">
                            <b>Description HTML:</b>{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: seo.description_html,
                              }}
                            />
                          </Typography>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
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
                mobileWebAppCapable: e.target.value === "true",
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
            label="Author Name"
            value={form.author_name}
            onChange={(e) => setForm({ ...form, author_name: e.target.value })}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editSEO ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SEOPage;
