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
      const token = localStorage.getItem("token");
      if (!token) {
        // No token, redirect to login
        const currentPath = location.pathname;
        if (currentPath.startsWith("/admin") || currentPath.startsWith("/subadmin")) {
          logout();
          if (currentPath.startsWith("/admin")) {
            navigate("/admin/login", { replace: true });
          } else {
            navigate("/subadmin/login", { replace: true });
          }
        }
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await api.get("/admin/check-auth");
        if (response.status === 200 && response.data.role) {
          // Token is valid, restore auth state
          login(response.data.role, token, response.data.username);
          setIsCheckingAuth(false);
        } else {
          // Invalid response
          throw new Error("Invalid session response");
        }
      } catch (error) {
        console.error("Admin auth check failed:", error, error.response?.status);
        // Token invalid or expired, clear it and redirect
        localStorage.removeItem("token");
        logout();
        const currentPath = location.pathname;
        if (currentPath.startsWith("/admin") || currentPath.startsWith("/subadmin")) {
          if (currentPath.startsWith("/admin")) {
            navigate("/admin/login", { replace: true });
          } else {
            navigate("/subadmin/login", { replace: true });
          }
        }
        setIsCheckingAuth(false);
      }
    };

    // Only check auth if not on login page
    if (!location.pathname.includes("/login")) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [location.pathname, login, logout, navigate]); // Run when pathname changes

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
    // Don't redirect if we're still checking auth
    if (isCheckingAuth) {
      return;
    }

    // Check if we have a token - if we do, auth check is handling it
    const token = localStorage.getItem("token");
    if (token) {
      // We have a token, let the auth check handle authentication
      return;
    }

    // No token and not authenticated, redirect to login
    if (!isAuthenticated || userRole === "member") {
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

  // Check if we have a token - if we do, wait for auth check to complete
  const token = localStorage.getItem("token");
  if (token && (!isAuthenticated || userRole === "member")) {
    // We have a token but auth state isn't set yet, wait a bit
    return null;
  }

  // Don't render if not authenticated and no token (redirect will happen)
  if (!token && (!isAuthenticated || userRole === "member")) {
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
            selected={location.pathname === (userRole === "sub" ? "/subadmin" : "/admin")}
            sx={{
              borderRadius: "12px",
              marginBottom: "8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: "rgba(50, 205, 50, 0.15)",
                transform: "translateX(4px)",
                "& .MuiListItemIcon-root": {
                  color: "#32cd32",
                },
                "& .MuiListItemText-primary": {
                  color: "#32cd32",
                },
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(50, 205, 50, 0.2)",
                borderLeft: "3px solid #32cd32",
                "& .MuiListItemIcon-root": {
                  color: "#32cd32",
                },
                "& .MuiListItemText-primary": {
                  color: "#32cd32",
                  fontWeight: 600,
                },
                "&:hover": {
                  backgroundColor: "rgba(50, 205, 50, 0.25)",
                },
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: "rgba(255, 255, 255, 0.85)", transition: "color 0.3s" }} />
            </ListItemIcon>
            <ListItemText 
              primary={t("儀表板")} 
              sx={{ 
                "& .MuiTypography-root": { 
                  color: "rgba(255, 255, 255, 0.85)",
                  transition: "all 0.3s",
                } 
              }} 
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to={userRole === "sub"
              ? "/subadmin/manage-members"
              : "/admin/manage-members"}
            onClick={handleDrawerLinkClick}
            selected={location.pathname === (userRole === "sub"
              ? "/subadmin/manage-members"
              : "/admin/manage-members")}
            sx={{
              borderRadius: "12px",
              marginBottom: "8px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: "rgba(50, 205, 50, 0.15)",
                transform: "translateX(4px)",
                "& .MuiListItemIcon-root": {
                  color: "#32cd32",
                },
                "& .MuiListItemText-primary": {
                  color: "#32cd32",
                },
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(50, 205, 50, 0.2)",
                borderLeft: "3px solid #32cd32",
                "& .MuiListItemIcon-root": {
                  color: "#32cd32",
                },
                "& .MuiListItemText-primary": {
                  color: "#32cd32",
                  fontWeight: 600,
                },
                "&:hover": {
                  backgroundColor: "rgba(50, 205, 50, 0.25)",
                },
              },
            }}
          >
            <ListItemIcon>
              <PeopleIcon sx={{ color: "rgba(255, 255, 255, 0.85)", transition: "color 0.3s" }} />
            </ListItemIcon>
            <ListItemText 
              primary={t("管理會員")} 
              sx={{ 
                "& .MuiTypography-root": { 
                  color: "rgba(255, 255, 255, 0.85)",
                  transition: "all 0.3s",
                } 
              }} 
            />
          </ListItemButton>
        </ListItem>
        {userRole === "main" && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/admin/manage-admins"
              onClick={handleDrawerLinkClick}
              selected={location.pathname === "/admin/manage-admins"}
              sx={{
                borderRadius: "12px",
                marginBottom: "8px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(50, 205, 50, 0.15)",
                  transform: "translateX(4px)",
                  "& .MuiListItemIcon-root": {
                    color: "#32cd32",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#32cd32",
                  },
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(50, 205, 50, 0.2)",
                  borderLeft: "3px solid #32cd32",
                  "& .MuiListItemIcon-root": {
                    color: "#32cd32",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#32cd32",
                    fontWeight: 600,
                  },
                  "&:hover": {
                    backgroundColor: "rgba(50, 205, 50, 0.25)",
                  },
                },
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: "rgba(255, 255, 255, 0.85)", transition: "color 0.3s" }} />
              </ListItemIcon>
              <ListItemText 
                primary={t("管理副管理員")} 
                sx={{ 
                  "& .MuiTypography-root": { 
                    color: "rgba(255, 255, 255, 0.85)",
                    transition: "all 0.3s",
                  } 
                }} 
              />
            </ListItemButton>
          </ListItem>
        )}
        {(userRole === "main" || userRole === "sub") && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to={userRole === "sub"
                ? "/subadmin/manage-records"
                : "/admin/manage-records"}
              onClick={handleDrawerLinkClick}
              selected={location.pathname === (userRole === "sub"
                ? "/subadmin/manage-records"
                : "/admin/manage-records")}
              sx={{
                borderRadius: "12px",
                marginBottom: "8px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(50, 205, 50, 0.15)",
                  transform: "translateX(4px)",
                  "& .MuiListItemIcon-root": {
                    color: "#32cd32",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#32cd32",
                  },
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(50, 205, 50, 0.2)",
                  borderLeft: "3px solid #32cd32",
                  "& .MuiListItemIcon-root": {
                    color: "#32cd32",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#32cd32",
                    fontWeight: 600,
                  },
                  "&:hover": {
                    backgroundColor: "rgba(50, 205, 50, 0.25)",
                  },
                },
              }}
            >
              <ListItemIcon>
                <EventNoteIcon sx={{ color: "rgba(255, 255, 255, 0.85)", transition: "color 0.3s" }} />
              </ListItemIcon>
              <ListItemText 
                primary={t("管理記錄")} 
                sx={{ 
                  "& .MuiTypography-root": { 
                    color: "rgba(255, 255, 255, 0.85)",
                    transition: "all 0.3s",
                  } 
                }} 
              />
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
          sx={{
            justifyContent: "center",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%)",
            color: "white",
            padding: "14px 20px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #ee5a6f 0%, #ff4757 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(255, 71, 87, 0.4)",
              "& .MuiListItemIcon-root": {
                transform: "scale(1.1)",
              },
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          <ListItemIcon sx={{ justifyContent: "center", minWidth: "40px" }}>
            <LogoutIcon sx={{ color: "white" }} />
          </ListItemIcon>
          <ListItemText 
            primary={t("登出")} 
            sx={{ 
              textAlign: "center",
              "& .MuiTypography-root": {
                fontWeight: 600,
              },
            }} 
          />
        </ListItemButton>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        component="nav"
        sx={{
          background: "linear-gradient(180deg, rgba(26, 31, 58, 0.95) 0%, rgba(15, 21, 41, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          position: "fixed",
          width: { sm: `calc(100% - 280px)` },
          ml: { sm: "280px" },
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          borderBottom: "1px solid rgba(50, 205, 50, 0.1)",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ 
          padding: { xs: "8px 16px", sm: "12px 24px" },
          minHeight: { xs: "56px", sm: "64px" },
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: "none" },
              color: "rgba(255, 255, 255, 0.9)",
              "&:hover": {
                backgroundColor: "rgba(50, 205, 50, 0.2)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              display: { xs: "none", sm: "block" },
              color: "rgba(255, 255, 255, 0.9)",
            }}
          />
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: { sm: 1, md: 2 },
            }}
          >
            {/* Top Navigation Links - Only visible on desktop */}
            <Link
              to="/#homePage"
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(50, 205, 50, 0.15)";
                e.currentTarget.style.color = "#32cd32";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
              }}
            >
              {t("主頁")}
            </Link>
            <Link
              to="/#raceRecords"
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(50, 205, 50, 0.15)";
                e.currentTarget.style.color = "#32cd32";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
              }}
            >
              {t("賽事紀錄")}
            </Link>
            <Link
              to="/#contactUs"
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(50, 205, 50, 0.15)";
                e.currentTarget.style.color = "#32cd32";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
              }}
            >
              {t("聯絡我們")}
            </Link>
            {isAuthenticated && (
              <Link
                to="/view-matches"
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(50, 205, 50, 0.15)";
                  e.currentTarget.style.color = "#32cd32";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
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
                  fontSize: "14px",
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
              width: 280,
              background: "linear-gradient(180deg, #1a1f3a 0%, #0f1529 100%)",
              color: "white",
              borderRight: "1px solid rgba(50, 205, 50, 0.1)",
              boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
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
              width: 280,
              background: "linear-gradient(180deg, #1a1f3a 0%, #0f1529 100%)",
              color: "white",
              borderRight: "1px solid rgba(50, 205, 50, 0.1)",
              boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
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
          width: { sm: `calc(100% - 280px)` },
          ml: { sm: "280px" },
          mt: { xs: "56px", sm: "64px" }, // Height of AppBar
          overflowX: "hidden",
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          padding: { xs: "16px", sm: "24px", md: "32px" },
          backgroundColor: "transparent",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
