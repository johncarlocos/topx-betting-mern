import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import styles from "./AdminLayout.module.scss";
import { useTranslation } from "react-i18next";
import { api } from "../utils/api";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  ContactMail as ContactMailIcon,
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  Home as HomeIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
  SportsSoccer as SportsSoccerIcon,
} from "@mui/icons-material";
import { Divider } from "@mui/material";
import i18n from "../i18n";

const AdminLayout = ({ children }) => {
  const { isAuthenticated, userRole, logout, login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const languageMenuOpen = Boolean(languageAnchorEl);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/admin/check-auth");
        if (response.status === 200 && response.data.role) {
          // Session is valid, restore auth state
          login(response.data.role);
        }
      } catch (error) {
        // Session is invalid or missing
        if (error.response?.status === 401 || error.response?.status === 404) {
          logout();
          const currentPath = location.pathname;
          if (currentPath.startsWith("/admin")) {
            navigate("/admin/login");
          } else if (currentPath.startsWith("/subadmin")) {
            navigate("/subadmin/login");
          } else {
            navigate("/login");
          }
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Only check if not already authenticated
    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, login, logout, navigate, location]);

  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      if (userRole === "sub" && location.pathname.startsWith("/admin")) {
        navigate("/subadmin");
      } else if (
        userRole === "main" && location.pathname.startsWith("/subadmin")
      ) {
        navigate("/admin");
      }
    }
  }, [isAuthenticated, userRole, location, navigate, isCheckingAuth]);

  const handleLogout = () => {
    logout();
    if (userRole === "main") {
      navigate("/admin/login");
    } else if (userRole === "sub") {
      navigate("/subadmin/login");
    } else {
      navigate("/login");
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  // Redirect if not authenticated after checking
  useEffect(() => {
    if (!isCheckingAuth && (!isAuthenticated || userRole === "member")) {
      const currentPath = location.pathname;
      if (currentPath.startsWith("/admin")) {
        navigate("/admin/login", { replace: true });
      } else if (currentPath.startsWith("/subadmin")) {
        navigate("/subadmin/login", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [isCheckingAuth, isAuthenticated, userRole, location, navigate]);

  // Show loading or nothing while checking auth
  if (isCheckingAuth) {
    return null; // or a loading spinner
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated || userRole === "member") {
    return null;
  }

  const handleDrawerLinkClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div className={styles.sidebarContent}>
      <Typography
        variant="h6"
        className={styles.adminTitle}
        sx={{ textAlign: "center", my: 2 }}
      >
        <Link to="/">
          <img
            src="/images/logo/topx-logo.png"
            alt="Logo"
            style={{ height: "70px", display: "block" }}
          />
        </Link>
      </Typography>
      {/* Admin Links */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to={userRole === "sub" ? "/subadmin" : "/admin"}
            onClick={handleDrawerLinkClick}
            sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary={t("儀表板")} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to={userRole === "sub"
              ? "/subadmin/manage-members"
              : "/admin/manage-members"}
            onClick={handleDrawerLinkClick}
            sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
          >
            <ListItemIcon>
              <PeopleIcon sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary={t("管理會員")} />
          </ListItemButton>
        </ListItem>
        {userRole === "main" && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to={userRole === "sub"
                ? "/subadmin/manage-admins"
                : "/admin/manage-admins"}
              onClick={handleDrawerLinkClick}
              sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary={t("管理副管理員")} />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      {/* Divider between Admin Links and Topnav Links - Only visible on mobile */}
      <Divider
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          my: 2,
          display: { xs: "block", sm: "none" },
        }}
      />

      {/* Top Navigation Links - Only visible on mobile */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/#homePage"
              onClick={handleDrawerLinkClick}
              sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
            >
              <ListItemIcon>
                <HomeIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary={t("主頁")} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/#raceRecords"
              onClick={handleDrawerLinkClick}
              sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
            >
              <ListItemIcon>
                <SportsSoccerIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary={t("賽事紀錄")} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/#contactUs"
              onClick={handleDrawerLinkClick}
              sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
            >
              <ListItemIcon>
                <ContactMailIcon sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText primary={t("聯絡我們")} />
            </ListItemButton>
          </ListItem>
          {isAuthenticated && (
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/view-matches"
                onClick={handleDrawerLinkClick}
                sx={{ "&:hover": { backgroundColor: "#32CD32" } }}
              >
                <ListItemIcon>
                  <EventNoteIcon sx={{ color: "white" }} />
                </ListItemIcon>
                <ListItemText primary={t("賽事系統")} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
      <Box sx={{ mt: "auto", mx: 2, mb: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ justifyContent: "center" }}
        >
          <ListItemIcon sx={{ justifyContent: "center" }}>
            <LogoutIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText primary={t("登出")} sx={{ textAlign: "center" }} />
        </ListItemButton>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        component="nav"
        sx={{
          backgroundColor: "#333",
          position: "fixed",
          width: { sm: `calc(100% - 300px)` },
          ml: { sm: "300px" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Top Navigation Links - Only visible on desktop */}
            <Link
              to="/#homePage"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              {t("主頁")}
            </Link>
            <Link
              to="/#raceRecords"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              {t("賽事紀錄")}
            </Link>
            <Link
              to="/#contactUs"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              {t("聯絡我們")}
            </Link>
            {isAuthenticated && (
              <Link
                to="/view-matches"
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                {t("賽事系統")}
              </Link>
            )}

            {(userRole === "main" || userRole === "sub") && (
              <Link
                to={userRole === "main" ? "/admin" : "/subadmin"}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                {t("管理")}
              </Link>
            )}
            <IconButton
              color="inherit"
              onClick={handleLanguageMenuOpen}
            >
              <LanguageIcon />
            </IconButton>
            <Menu
              anchorEl={languageAnchorEl}
              open={languageMenuOpen}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => changeLanguage("en")}>
                <img
                  src="/images/icon/us.svg"
                  alt="English"
                  style={{ marginRight: "8px", width: "20px", height: "20px" }}
                />
                English
              </MenuItem>
              <MenuItem onClick={() => changeLanguage("zh")}>
                <img
                  src="/images/icon/china.svg"
                  alt="Chinese"
                  style={{ marginRight: "8px", width: "20px", height: "20px" }}
                />
                中文
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: 300 },
          flexShrink: 0,
          position: "fixed",
          height: "100vh",
          zIndex: 1200,
          overflowY: "auto",
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              backgroundColor: "#333",
              color: "white",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 300,
              backgroundColor: "#333",
              color: "white",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - 300px)` },
          ml: { sm: "300px" },
          mt: "64px", // Height of AppBar
          overflowX: "auto",
          minHeight: "calc(100vh - 64px)",
          padding: { xs: 0, sm: 3 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
