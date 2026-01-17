import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../utils/api";
import {
  Box,
  Card,
  Grid,
  Typography,
  CircularProgress,
  Dialog,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const MatchRecords = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

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

  const handleCardClick = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDialog = () => {
    setSelectedRecord(null);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 120px)",
          paddingTop: { xs: "120px", sm: "100px" },
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
          minHeight: "calc(100vh - 120px)",
          paddingTop: { xs: "120px", sm: "100px" },
          color: "#fff",
        }}
      >
        <Typography variant="body1">載入記錄時發生錯誤</Typography>
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
          minHeight: "calc(100vh - 120px)",
          paddingTop: { xs: "120px", sm: "100px" },
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Typography variant="h6">暫無記錄</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          paddingTop: { xs: "120px", sm: "100px", md: "100px" },
          paddingBottom: { xs: "40px", sm: "60px", md: "80px" },
          paddingX: { xs: "12px", sm: "16px", md: "20px", lg: "24px", xl: "32px" },
          backgroundColor: "transparent",
          minHeight: "100vh",
          maxWidth: { xs: "100%", sm: "100%", md: "100%", lg: "100%", xl: "100%" },
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Grid container spacing={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2.5 }}>
          {records.map((record) => (
            <Grid item xs={4} sm={4} md={3} lg={2} xl={2} key={record._id}>
              <Card
                onClick={() => handleCardClick(record)}
                sx={{
                  backgroundColor: "rgba(26, 31, 58, 0.6)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "rgba(50, 205, 50, 0.5)",
                    boxShadow: "0 8px 24px rgba(50, 205, 50, 0.3)",
                    transform: "scale(1.02)",
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
                      aspectRatio: "1",
                      position: "relative",
                      overflow: "hidden",
                      backgroundColor: "#1a1a1a",
                    }}
                  >
                    {record.mediaType === "video" ? (
                      <video
                        src={record.mediaUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231a1a1a' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EVideo not found%3C/text%3E%3C/svg%3E";
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
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%231a1a1a' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    )}
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Full Screen Dialog */}
      <Dialog
        open={!!selectedRecord}
        onClose={handleCloseDialog}
        fullScreen={fullScreen}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        {selectedRecord && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: fullScreen ? "100vh" : "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={handleCloseDialog}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 1000,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Media Display */}
            {selectedRecord.mediaUrl && (
              <Box
                sx={{
                  width: "100%",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#000",
                  padding: { xs: 2, sm: 4 },
                }}
              >
                {selectedRecord.mediaType === "video" ? (
                  <video
                    src={selectedRecord.mediaUrl}
                    controls
                    autoPlay
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%231a1a1a' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='18'%3EVideo not found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <img
                    src={selectedRecord.mediaUrl}
                    alt={selectedRecord.text}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%231a1a1a' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='18'%3EImage not found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                )}
              </Box>
            )}

            {/* Details Section */}
            <Box
              sx={{
                padding: { xs: 3, sm: 4 },
                backgroundColor: "rgba(26, 31, 58, 0.8)",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#32cd32",
                  display: "block",
                  mb: 1,
                }}
              >
                {formatDate(selectedRecord.date)}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  wordBreak: "break-word",
                }}
              >
                {selectedRecord.text}
              </Typography>
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default MatchRecords;

