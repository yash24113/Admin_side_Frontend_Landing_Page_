import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const SessionTimeoutWarning = () => {
  const { user, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if session is about to expire (within 5 minutes)
    const checkSessionTimeout = () => {
      if (user.lastLogin) {
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        const timeUntilExpiry =
          sessionTimeout - (Date.now() - new Date(user.lastLogin).getTime());

        if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
          setOpen(true);
          setTimeLeft(Math.floor(timeUntilExpiry / 1000));
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkSessionTimeout, 60 * 1000);
    checkSessionTimeout(); // Initial check

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const response = await axios.post(
        "https://age-landing-backend.egport.com/api/auth/extend-session",
        {
          email: user.email,
        }
      );

      if (response.data.user) {
        login(response.data.user);
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      handleLogout();
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Warning color="warning" />
        Session Timeout Warning
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your session will expire in <strong>{formatTime(timeLeft)}</strong>.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To continue working, please extend your session or save your work and
          logout.
        </Typography>
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(timeLeft / 300) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleLogout} variant="outlined" color="error">
          Logout Now
        </Button>
        <Button
          onClick={handleExtendSession}
          variant="contained"
          disabled={isExtending}
        >
          {isExtending ? "Extending..." : "Extend Session"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutWarning;
