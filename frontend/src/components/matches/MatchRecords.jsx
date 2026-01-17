import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const MatchRecords = () => {
  const { data: recordsData, isLoading, error } = useQuery({
    queryKey: ["matchRecords"],
    queryFn: async () => {
      const response = await api.get("/match-record");
      return response.data;
    },
  });

  const records = recordsData?.records || [];

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "yyyy年MM月dd日", { locale: zhCN });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress sx={{ color: "#32cd32" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: "#fff",
        }}
      >
        <Typography>載入記錄時發生錯誤</Typography>
      </Box>
    );
  }

  if (records.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Typography variant="h6">暫無記錄</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: "20px", sm: "40px", md: "60px" },
        backgroundColor: "transparent",
        minHeight: "100vh",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Enhanced Title Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: { xs: 4, sm: 6, md: 8 },
          position: "relative",
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: "#32cd32",
            fontWeight: 700,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            mb: 1,
            textShadow: "0 2px 10px rgba(50, 205, 50, 0.3)",
            letterSpacing: "0.05em",
          }}
        >
          每日賽事記錄
        </Typography>
        <Box
          sx={{
            width: "80px",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #32cd32, transparent)",
            margin: "0 auto",
            borderRadius: "2px",
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {records.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record._id}>
            <Card
              sx={{
                backgroundColor: "rgba(26, 31, 58, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                overflow: "hidden",
                "&:hover": {
                  borderColor: "rgba(50, 205, 50, 0.3)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                  transform: "translateY(-4px)",
                },
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {record.mediaUrl && (
                <Box
                  sx={{
                    width: "100%",
                    height: "280px",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "#1a1a1a",
                  }}
                >
                  {record.mediaType === "video" ? (
                    <video
                      src={record.mediaUrl}
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={record.mediaUrl}
                      alt={record.text}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        console.error(`Failed to load image from: ${record.mediaUrl}`);
                        console.error(`Full record data:`, record);
                        // Show error placeholder instead of hiding
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='280'%3E%3Crect fill='%231a1a1a' width='400' height='280'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                      onLoad={() => {
                        console.log(`Successfully loaded image: ${record.mediaUrl}`);
                      }}
                    />
                  )}
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#32cd32",
                    display: "block",
                    mb: 2,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {formatDate(record.date)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    wordBreak: "break-word",
                    lineHeight: 1.7,
                    flexGrow: 1,
                    fontSize: "1rem",
                  }}
                >
                  {record.text}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MatchRecords;

