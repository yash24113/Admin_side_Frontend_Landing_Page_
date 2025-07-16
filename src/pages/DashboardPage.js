import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import {
  Public as CountryIcon,
  Flag as StateIcon,
  LocationCity as CityIcon,
  Place as LocationIcon,
  ShoppingCart as ProductIcon,
  Message as MessageIcon,
  Public as SeoIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BACKEND_API = "https://age-landing-backend.egport.com";
const EMPLOYEE_API = "https://emsbackend-production-5b9b.up.railway.app/employees";
const OFFICE_API = "https://emsbackend-production-5b9b.up.railway.app/offices";

const StatCard = ({ title, count, icon, color, loading, onClick }) => {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
        border: `1px solid ${color}30`,
        transition: "all 0.3s ease",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 25px ${color}20`,
              opacity: 0.95,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: color,
                mb: 1,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : count}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: "50%",
              background: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, {
              sx: { fontSize: 32, color: color },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

function DashboardPage() {
  const [stats, setStats] = useState({
    countries: 0,
    states: 0,
    cities: 0,
    locations: 0,
    products: 0,
    inquiries: 0,
    seos: 0,
    employees: 0,
    offices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch counts for each entity
      const [
        countriesRes,
        statesRes,
        citiesRes,
        locationsRes,
        productsRes,
        inquiriesRes,
        seosRes,
        employeesRes,
        officesRes
      ] = await Promise.all([
        api.get(`${BACKEND_API}/api/countries`),
        api.get(`${BACKEND_API}/api/states`),
        api.get(`${BACKEND_API}/api/cities`),
        api.get(`${BACKEND_API}/api/locations`),
        api.get(`${BACKEND_API}/api/products`),
        api.get(`${BACKEND_API}/api/inquiries`),
        api.get(`${BACKEND_API}/api/seos`),
        // fetch employees from EMS API
        (await import('axios')).default.get(EMPLOYEE_API),
        (await import('axios')).default.get(OFFICE_API),
      ]);

      setStats({
        countries: countriesRes.data.length || 0,
        states: statesRes.data.length || 0,
        cities: citiesRes.data.length || 0,
        locations: locationsRes.data.length || 0,
        products: productsRes.data.length || 0,
        inquiries: inquiriesRes.data.length || 0,
        seos: seosRes.data.length || 0,
        employees: employeesRes.data.length || 0,
        offices: officesRes.data.length || 0,
      });
      toast.success("Dashboard statistics loaded successfully!");
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics. Please try again later.");
      toast.error("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Countries",
      count: stats.countries,
      icon: <CountryIcon />,
      color: "#2196F3",
      path: "/countries",
    },
    {
      title: "States",
      count: stats.states,
      icon: <StateIcon />,
      color: "#4CAF50",
      path: "/states",
    },
    {
      title: "Cities",
      count: stats.cities,
      icon: <CityIcon />,
      color: "#FF9800",
      path: "/cities",
    },
    {
      title: "Locations",
      count: stats.locations,
      icon: <LocationIcon />,
      color: "#9C27B0",
      path: "/locations",
    },
    {
      title: "Products",
      count: stats.products,
      icon: <ProductIcon />,
      color: "#F44336",
      path: "/products",
    },
    {
      title: "Business Inquiries",
      count: stats.inquiries,
      icon: <MessageIcon />,
      color: "#7C4DFF",
      path: "/inquiries",
    },
    {
      title: "SEOs",
      count: stats.seos,
      icon: <SeoIcon />,
      color: "#00BCD4",
      path: "/seos",
    },
    {
      title: "Employees",
      count: stats.employees,
      icon: <PeopleIcon />,
      color: "#607D8B",
      path: "/employees",
    },
    {
      title: "Offices",
      count: stats.offices,
      icon: <BusinessIcon />,
      color: "#795548",
      path: "/offices",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome to Admin Dashboard
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage your countries, states, cities, locations,products , SEO and
          Business Inquiry efficiently
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.title}>
            <StatCard
              title={card.title}
              count={card.count}
              icon={card.icon}
              color={card.color}
              loading={loading}
              onClick={card.path ? () => navigate(card.path) : undefined}
            />
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mt: 4,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use the sidebar navigation to manage your data. Each section provides
          full CRUD operations for creating, reading, updating, and deleting
          records.
        </Typography>
      </Paper>
    </Box>
  );
}

export default DashboardPage;
