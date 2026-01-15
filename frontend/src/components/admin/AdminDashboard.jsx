import React, { useEffect, useState } from "react";
import useGetAllSubAdmins from "../../hooks/useGetAllSubAdmins";
import styles from "./AdminDashboard.module.scss";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../store/authStore";
import useGetAllMembers from "../../hooks/useGetAllMembers";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { userRole } = useAuthStore();
  const { data: members, isLoading, error } = useGetAllMembers();
  const [memberCount, setMemberCount] = useState(0);
  const {
    data: subAdmins,
    isLoading: isSubAdminsLoading,
    error: subAdminsError,
  } = useGetAllSubAdmins();
  const [adminCount, setAdminCount] = useState(1);

  useEffect(() => {
    if (members) {
      // Handle both old format (array) and new format (object with data and pagination)
      if (Array.isArray(members)) {
        setMemberCount(members.length);
      } else if (members.data && Array.isArray(members.data)) {
        setMemberCount(members.pagination?.total || members.data.length);
      } else {
        setMemberCount(0);
      }
    } else {
      setMemberCount(0);
    }
  }, [members]);

  useEffect(() => {
    if (userRole === "main" && subAdmins) {
      setAdminCount(subAdmins.length);
    }
  }, [userRole, subAdmins]);

  return (
    <div className={styles.dashboardContainer}>
      <Typography
        variant="h4"
        component="h1"
        className={styles.dashboardTitle}
        gutterBottom
        sx={{ color: "white" }}
      >
        {userRole === "sub" ? t("副管理員儀表板") : t("管理員儀表板")}
      </Typography>
      <Card 
        sx={{
          backgroundColor: "rgba(26, 31, 58, 0.6)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "rgba(50, 205, 50, 0.3)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
          },
        }}
      >
        <CardContent sx={{ padding: "40px" }}>
          <Typography 
            variant="body1" 
            paragraph
            sx={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              marginBottom: "24px",
            }}
          >
            {userRole === "sub"
              ? t("歡迎來到副管理員儀表板。")
              : t("歡迎來到管理員儀表板。")}
          </Typography>
          <Box mb={2}>
            <Typography 
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "1.1rem",
                marginBottom: "16px",
              }}
            >
              {t("管理會員")}:{" "}
              <Typography 
                component="span" 
                sx={{
                  fontWeight: 700,
                  marginLeft: "8px",
                  color: "#32cd32",
                  fontSize: "1.25rem",
                }}
              >
                {isLoading ? t("分析中...") : memberCount}
              </Typography>
            </Typography>
            {userRole === "main" && (
              <Typography 
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontSize: "1.1rem",
                }}
              >
                {t("管理管理員")}:{" "}
                <Typography 
                  component="span"
                  sx={{
                    fontWeight: 700,
                    marginLeft: "8px",
                    color: "#32cd32",
                    fontSize: "1.25rem",
                  }}
                >
                  {isSubAdminsLoading
                    ? t("分析中...")
                    : subAdminsError
                    ? t("加載失敗")
                    : adminCount}
                </Typography>
              </Typography>
            )}
          </Box>
          <Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {(userRole === "main" || userRole === "sub") && (
                <Button
                  component={Link}
                  to={userRole === "sub" ? "/subadmin/manage-members" : "/admin/manage-members"}
                  variant="contained"
                  color="primary"
                  sx={{
                    background: "linear-gradient(135deg, #32cd32 0%, #28a428 100%)",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(50, 205, 50, 0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #28a428 0%, #32cd32 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(50, 205, 50, 0.4)",
                    },
                  }}
                >
                  {t("管理會員")}
                </Button>
              )}
              {userRole === "main" && (
                <Button
                  component={Link}
                  to="/admin/manage-admins"
                  variant="contained"
                  color="primary"
                  sx={{
                    background: "linear-gradient(135deg, #32cd32 0%, #28a428 100%)",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(50, 205, 50, 0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #28a428 0%, #32cd32 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(50, 205, 50, 0.4)",
                    },
                  }}
                >
                  {t("管理管理員")}
                </Button>
              )}
            </Box>
          </Box>
          {error && (
            <Typography variant="body2" color="error" mt={2}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
