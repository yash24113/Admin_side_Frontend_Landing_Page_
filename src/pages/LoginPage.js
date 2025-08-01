import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
  Grow,
  CircularProgress,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import companyLogo from "../images/amrita-logo.png";

// Environment variable for API
// use this in CRA
const BACKEND_API = process.env.ATTENDANCE_BACKEND_API;

// Rainbow animation border
const rainbowBorder = {
  background:
    "linear-gradient(45deg, #ff0057, #ff7e00, #fffb00, #00ff00, #00c6ff, #5f00ff, #ff00d4)",
  backgroundSize: "600% 600%",
  animation: "borderGradient 6s ease infinite",
  borderRadius: "12px",
  padding: "2px",
  "@keyframes borderGradient": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
};

const allowedEmails = (process.env.REACT_APP_ALLOWED_EMAILS || "")
  .split(",")
  .map(e => e.trim())
  .filter(Boolean);

function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "false"
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  useEffect(() => {
    if (modalOpen) {
      const timeout = setTimeout(() => setModalOpen(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [modalOpen]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const showModal = (message) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleRequestOtp = async () => {
    setError("");
    if (!allowedEmails.includes(email)) {
      setError("Email not authorized for admin access");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BACKEND_API}/api/auth/request-otp`, {
        email,
      });
      setStep(2);
      setTimer(60);
      showModal("OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_API}/api/auth/verify-otp`, {
        email,
        otp,
      });
      login({ ...res.data.user, isVerified: true });
      showModal("Login successful!");
      setTimeout(() => {
        setModalOpen(false);
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  const buttonCommonStyles = {
    transition: "all 0.3s ease",
    transform: darkMode ? "scale(1.02)" : "scale(1)",
    background: loading
      ? "linear-gradient(270deg, #ff6ec4, #7873f5, #00c9ff, #92fe9d)"
      : undefined,
    backgroundSize: "600% 600%",
    animation: loading ? "loadingShimmer 2s infinite" : undefined,
    color: "#fff",
    "&:hover": {
      backgroundColor: darkMode ? "#333" : "#1976d2",
      transform: "scale(1.05)",
    },
    "@keyframes loadingShimmer": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  };

  return (
    <main>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle color="success" />
          Success
        </DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
      </Dialog>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={darkMode ? "#121212" : "#f4f6f8"}
        px={2}
        sx={{
          transition: "background-color 0.4s ease-in-out",
        }}
      >
        <Grow in timeout={500}>
          <Box sx={rainbowBorder}>
            <Paper
              elevation={8}
              sx={{
                p: 4,
                maxWidth: 420,
                width: "100%",
                bgcolor: darkMode ? "#1e1e1e" : "#fff",
                color: darkMode ? "#f0f0f0" : "#000",
                borderRadius: "10px",
                transition: "all 0.4s ease-in-out",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={3}
              >
                <img
                  src={companyLogo}
                  alt="Amrita Global Enterprises Logo"
                  width={40}
                  height={40}
                  style={{
                    marginRight: 10,
                    transition: "transform 0.8s ease-in-out",
                    transform: darkMode ? "rotate(360deg)" : "none",
                  }}
                />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Amrita Global Enterprises
                </Typography>
              </Box>

              <Box display="flex" justifyContent="center" mb={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                  sx={{ color: darkMode ? "#f0f0f0" : "#000" }}
                />
              </Box>

              <Divider
                sx={{ mb: 3, borderColor: darkMode ? "#555" : "#ccc" }}
              />

              <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{ color: darkMode ? "#f0f0f0" : "#000" }}
              >
                Admin Login
              </Typography>
              <Typography
                variant="body2"
                align="center"
                sx={{ mb: 3, color: darkMode ? "#aaa" : "#555" }}
              >
                Use your email and OTP to sign in.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {step === 1 && (
                <>
                  <TextField
                    label="Authorized Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    InputLabelProps={{
                      style: { color: darkMode ? "#ccc" : "#000" },
                    }}
                    InputProps={{
                      style: { color: darkMode ? "#f0f0f0" : "#000" },
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleRequestOtp}
                    disabled={loading}
                    sx={{ mt: 2, ...buttonCommonStyles }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    autoFocus
                    inputMode="numeric"
                    InputLabelProps={{
                      style: { color: darkMode ? "#ccc" : "#000" },
                    }}
                    InputProps={{
                      style: { color: darkMode ? "#f0f0f0" : "#000" },
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    sx={{ mt: 2, ...buttonCommonStyles }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={handleRequestOtp}
                    disabled={timer > 0}
                    sx={{
                      mt: 1,
                      color: darkMode ? "#fff" : "#888",
                      "&:hover": {
                        backgroundColor: darkMode ? "#ffffff0a" : "#f5f5f5",
                      },
                    }}
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => setStep(1)}
                    sx={{
                      mt: 1,
                      color: darkMode ? "#fff" : "#888",
                      "&:hover": {
                        backgroundColor: darkMode ? "#ffffff0a" : "#f5f5f5",
                      },
                    }}
                  >
                    Change Email
                  </Button>
                </>
              )}
            </Paper>
          </Box>
        </Grow>
      </Box>
    </main>
  );
}

export default LoginPage;
