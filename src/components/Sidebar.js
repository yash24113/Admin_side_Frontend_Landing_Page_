import React from "react";
import { NavLink } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Toolbar,
  Divider,
  ListItemButton,
  IconButton,
  Tooltip,
  ListSubheader,
  Collapse,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import FlagIcon from "@mui/icons-material/Flag";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PlaceIcon from "@mui/icons-material/Place";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MessageIcon from "@mui/icons-material/Message";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Countries", icon: <PublicIcon />, path: "/countries" },
  { text: "States", icon: <FlagIcon />, path: "/states" },
  { text: "Cities", icon: <LocationCityIcon />, path: "/cities" },
  { text: "Locations", icon: <PlaceIcon />, path: "/locations" },
  { text: "Products", icon: <ShoppingCartIcon />, path: "/products" },
  { text: "SEO", icon: <PublicIcon />, path: "/seos" },
  { text: "Business Inquiry", icon: <MessageIcon />, path: "/inquiries" },
];

function Sidebar({
  open,
  onClose,
  onToggle,
  variant = "permanent",
  collapsed = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerWidth = collapsed ? 64 : 280;

  const [emsOpen, setEmsOpen] = React.useState(false);

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2,
          minHeight: "64px",
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            Admin Panel
          </Typography>
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              textAlign: "center",
              mb: 1,
            }}
          >
            {/* Navigation */}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Box>
      )}
      <List sx={{ px: collapsed ? 1 : 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <Tooltip
              title={collapsed ? item.text : ""}
              placement="right"
              disableHoverListener={!collapsed}
            >
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  borderRadius: collapsed ? 1 : 2,
                  minHeight: collapsed ? 48 : 56,
                  justifyContent: collapsed ? "center" : "flex-start",
                  "&.active": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 24 : 40,
                    color: "text.secondary",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
        {/* EMS Dropdown */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <Tooltip
            title={collapsed ? "EMS" : ""}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              onClick={() => setEmsOpen((prev) => !prev)}
              sx={{
                borderRadius: collapsed ? 1 : 2,
                minHeight: collapsed ? 48 : 56,
                justifyContent: collapsed ? "center" : "flex-start",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 24 : 40,
                  color: "text.secondary",
                  justifyContent: "center",
                }}
              >
                <PublicIcon />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="EMS"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              )}
              {!collapsed && (emsOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <Collapse in={emsOpen && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              component={NavLink}
              to="/attendance"
              onClick={isMobile ? onClose : undefined}
              sx={{
                pl: 6,
                borderRadius: 2,
                minHeight: 48,
                "&.active": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
                          <ListItemIcon sx={{ minWidth: 24, color: "text.secondary" }}>
              <ScheduleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Attendance" primaryTypographyProps={{ fontWeight: 400 }} />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/employees"
              onClick={isMobile ? onClose : undefined}
              sx={{
                pl: 6,
                borderRadius: 2,
                minHeight: 48,
                "&.active": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
                          <ListItemIcon sx={{ minWidth: 24, color: "text.secondary" }}>
              <PeopleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Employee" primaryTypographyProps={{ fontWeight: 400 }} />
            </ListItemButton>
            <ListItemButton
              component={NavLink}
              to="/offices"
              onClick={isMobile ? onClose : undefined}
              sx={{
                pl: 6,
                borderRadius: 2,
                minHeight: 48,
                "&.active": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
                          <ListItemIcon sx={{ minWidth: 24, color: "text.secondary" }}>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Office" primaryTypographyProps={{ fontWeight: 400 }} />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          overflowX: "hidden",
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

// Toggle Button Component
export function SidebarToggleButton({ onToggle, sx = {} }) {
  return (
    <IconButton
      onClick={onToggle}
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 1200,
        backgroundColor: "background.paper",
        boxShadow: 2,
        "&:hover": {
          backgroundColor: "action.hover",
        },
        ...sx,
      }}
    >
      <MenuIcon />
    </IconButton>
  );
}

export default Sidebar;
