import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import Logo from "../images/amrita-logo.png"; // ✅ Replace with actual path to your logo image
import { styled } from "@mui/system";
import ConfirmDialog from "./ConfirmDialog";

function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => setLogoutConfirm(true);

  const confirmLogout = () => {
    setLogoutConfirm(false);
    handleLogout();
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* ✅ Company Logo & Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <a href="/" className="flex items-center space-x-2 group">
            <img
              src="https://amritafashions.com/wp-content/uploads/amrita-fashions-small-logo-india.webp"
              alt="Amrita Global Enterprise Logo"
              width={40}
              height={40}
              loading="lazy"
              style={{ height: 40, width: 40, objectFit: "contain" }}
            />
             </a>
             <a href="/" style={{ textDecoration:"none"}}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#fff",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                whiteSpace: "nowrap",
               
              }}
            >
              Amrita Global Enterprises
            </Typography>
            </a>
          </Box>
        </Box>

        {user && user.isVerified && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={handleMenu}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  width: 40,
                  height: 40,
                }}
              >
                {getInitials(user.name || user.email)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem onClick={handleClose} sx={{ py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getInitials(user.name || user.email)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user.name || "Admin"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick} sx={{ py: 1.5 }}>
                <Logout sx={{ mr: 2, fontSize: 20 }} />
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
      <ConfirmDialog
        open={logoutConfirm}
        title="Confirm Logout"
        content="Are you sure you want to logout?"
        onClose={() => setLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </AppBar>
  );
}

export default Header;
