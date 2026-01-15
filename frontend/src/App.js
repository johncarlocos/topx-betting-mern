import React, { Fragment, useEffect } from "react";
import { Helmet } from "react-helmet";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import ScrollToTop from "./components/ScrollToTop";
import TopNav from "./components/header/TopNav";
import { api, handleApiError } from "./utils/api";
import useAuthStore from "./store/authStore";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, setUserRole } = useAuthStore();

  useEffect(() => {
    AOS.init({
      duration: 1200,
    });
  }, []);

  useEffect(() => {
    const checkBlockedStatus = async () => {
      const token = localStorage.getItem("token");
      if (
        token && location.pathname !== "/login" &&
        location.pathname !== "/admin/login" &&
        location.pathname !== "/subadmin/login" &&
        !location.pathname.startsWith("/admin") &&
        !location.pathname.startsWith("/subadmin")
      ) {
        // Decode token to check if it's a member token
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            // Only check member auth if token role is "member"
            if (payload.role === "member") {
              try {
                const response = await api.get("/member/check-auth");
                if (response.status === 200) {
                  setUserRole("member");
                }
              } catch (error) {
                if (error.response && (error.response.status === 403 || error.response.status === 401)) {
                  localStorage.removeItem("token");
                  logout();
                  navigate("/login");
                } else {
                  handleApiError(error, navigate);
                }
              }
            }
            // If token is admin/subadmin, don't check member auth - they can access public pages
          }
        } catch (error) {
          // If token decode fails, it might be invalid - but don't clear it here
          // Let the specific route handlers deal with invalid tokens
          console.warn("Token decode error:", error);
        }
      }
    };

    checkBlockedStatus();
  }, [isAuthenticated, navigate, logout, location, setUserRole]);

  return (
    <Fragment>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="Data Science, Analytics, Data, sass, software company"
        />
        <meta name="description" content="TopX" />
        <meta property="og:site_name" content="TopX" />
        <meta property="og:url" content="https://topxhk.ai/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TopX" />
      </Helmet>
      {/* {End Seo Helmet} */}
      <ScrollToTop />
      <AppRouter />
    </Fragment>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
