import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, useTheme, useMediaQuery, CircularProgress } from "@mui/material";
import Sidebar, { SidebarToggleButton } from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CountryPage = lazy(() => import("./pages/CountryPage"));
const StatePage = lazy(() => import("./pages/StatePage"));
const CityPage = lazy(() => import("./pages/CityPage"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SEOPage = lazy(() => import("./pages/SEOPage"));
const InquiryAdminPage = lazy(() => import("./pages/InquiryAdminPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const EmployeePage = lazy(() => import("./pages/EmployeePage"));
const OfficePage = lazy(() => import("./pages/OfficePage"));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return user && user.isVerified ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const handleMenuToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // On mobile, sidebar should be closed by default
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 280;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header onMenuToggle={handleMenuToggle} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          onToggle={handleMenuToggle}
          variant={isMobile ? "temporary" : "permanent"}
          collapsed={sidebarCollapsed}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "calc(100vh - 64px)",
            mt: "64px", // Account for fixed header
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>}>
            <Routes>
              <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/countries" element={<PrivateRoute><CountryPage /></PrivateRoute>} />
              <Route path="/states" element={<PrivateRoute><StatePage /></PrivateRoute>} />
              <Route path="/cities" element={<PrivateRoute><CityPage /></PrivateRoute>} />
              <Route path="/locations" element={<PrivateRoute><LocationPage /></PrivateRoute>} />
              <Route path="/products" element={<PrivateRoute><ProductPage /></PrivateRoute>} />
              <Route path="/inquiries" element={<PrivateRoute><InquiryAdminPage /></PrivateRoute>} />
              <Route path="/seos" element={<PrivateRoute><SEOPage /></PrivateRoute>} />
              <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
              <Route path="/employees" element={<PrivateRoute><EmployeePage /></PrivateRoute>} />
              <Route path="/offices" element={<PrivateRoute><OfficePage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
      {location.pathname !== "/seos" && location.pathname !== "/attendance" && <Footer />}
      <SessionTimeoutWarning />
    </Box>
  );
}

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (location.pathname === "/login") {
    if (user && user.isVerified) {
      return <Navigate to="/" replace />;
    }
    return (
      <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>}>
        <LoginPage />
      </Suspense>
    );
  }

  if (!user || !user.isVerified) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}
