import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { api } from "../../utils/api";

/**
 * Protected route component that allows authenticated users (members, admins, subadmins) to access
 * Blocks: unauthenticated users only
 */
const ProtectedMemberRoute = ({ children }) => {
  const { isAuthenticated, userRole, login, logout } = useAuthStore();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      // No token at all - redirect to login
      if (!token) {
        setIsCheckingAuth(false);
        setIsAuthorized(false);
        return;
      }

      try {
        // Decode token to check role
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const tokenRole = payload.role;

          // Verify authentication based on role
          if (tokenRole === "member") {
            // Verify member authentication with backend
            try {
              const response = await api.get("/member/check-auth");
              if (response.status === 200) {
                // Member is authenticated and not blocked
                login("member", token, response.data.username);
                setIsAuthorized(true);
              } else {
                setIsAuthorized(false);
              }
            } catch (error) {
              // Token invalid, expired, or member is blocked
              console.error("Member auth check failed:", error);
              localStorage.removeItem("token");
              logout();
              setIsAuthorized(false);
            }
          } else if (tokenRole === "main" || tokenRole === "sub") {
            // Verify admin/subadmin authentication with backend
            try {
              const response = await api.get("/admin/check-auth");
              if (response.status === 200 && response.data.role) {
                // Admin/subadmin is authenticated
                login(response.data.role, token, response.data.username);
                setIsAuthorized(true);
              } else {
                setIsAuthorized(false);
              }
            } catch (error) {
              // Token invalid or expired
              console.error("Admin auth check failed:", error);
              localStorage.removeItem("token");
              logout();
              setIsAuthorized(false);
            }
          } else {
            // Unknown role
            setIsAuthorized(false);
            localStorage.removeItem("token");
            logout();
          }
        } else {
          // Invalid token format
          setIsAuthorized(false);
          localStorage.removeItem("token");
          logout();
        }
      } catch (error) {
        // Token decode failed
        console.error("Token decode error:", error);
        setIsAuthorized(false);
        localStorage.removeItem("token");
        logout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [location.pathname, userRole, login, logout]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#32cd32",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authorized
  if (!isAuthorized || !isAuthenticated) {
    // Determine appropriate login page based on attempted access
    let loginPath = "/login";
    if (userRole === "main") {
      loginPath = "/admin/login";
    } else if (userRole === "sub") {
      loginPath = "/subadmin/login";
    }
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // Render protected content for any authenticated user (member, admin, or subadmin)
  return children;
};

export default ProtectedMemberRoute;

