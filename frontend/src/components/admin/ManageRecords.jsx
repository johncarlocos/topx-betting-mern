import React, { useState } from "react";
import styles from "./ManageMembers.module.scss";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
} from "@mui/icons-material";
import { api } from "../../utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const ManageRecords = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    text: "",
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Fetch all records
  const { data: recordsData, isLoading } = useQuery({
    queryKey: ["matchRecords"],
    queryFn: async () => {
      const response = await api.get("/match-record");
      return response.data;
    },
  });

  const records = recordsData?.records || [];

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#32cd32",
        light: "#5cdd5c",
        dark: "#28a428",
      },
      background: {
        default: "transparent",
        paper: "rgba(26, 31, 58, 0.8)",
      },
      text: {
        primary: "rgba(255, 255, 255, 0.9)",
        secondary: "rgba(255, 255, 255, 0.7)",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            padding: "10px 24px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(50, 205, 50, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(50, 205, 50, 0.4)",
            },
          },
          contained: {
            background: "linear-gradient(135deg, #32cd32 0%, #28a428 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #28a428 0%, #32cd32 100%)",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "rgba(26, 31, 58, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: "1px solid rgba(50, 205, 50, 0.2)",
          },
        },
      },
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append("date", data.date);
      formDataToSend.append("text", data.text);
      if (data.files && data.files.length > 0) {
        // Append all files with the same field name "media"
        data.files.forEach((file) => {
          formDataToSend.append("media", file);
        });
      }

      const response = await api.post("/match-record", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["matchRecords"]);
      setSnackbarMessage(t("記錄創建成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseDialog();
    },
    onError: (error) => {
      setSnackbarMessage(
        error.response?.data?.message || t("創建記錄失敗")
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/match-record/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["matchRecords"]);
      setSnackbarMessage(t("記錄刪除成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setDeleteOpen(false);
    },
    onError: (error) => {
      setSnackbarMessage(
        error.response?.data?.message || t("刪除記錄失敗")
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormData({ date: "", text: "" });
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ date: "", text: "" });
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate: only one video allowed
    const videoCount = files.filter((file) => file.type.startsWith("video/")).length;
    if (videoCount > 1) {
      setSnackbarMessage(t("只能上傳一個影片"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      event.target.value = ""; // Reset file input
      return;
    }

    setSelectedFiles(files);

    // Create previews for all files
    const previews = [];
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({ type: "image", url: reader.result, name: file.name });
          if (previews.length === files.length) {
            setFilePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({ type: "video", url: reader.result, name: file.name });
          if (previews.length === files.length) {
            setFilePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.text) {
      setSnackbarMessage(t("請填寫所有必填欄位"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (selectedFiles.length === 0) {
      setSnackbarMessage(t("請至少選擇一個檔案"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    createMutation.mutate({
      date: formData.date,
      text: formData.text,
      files: selectedFiles,
    });
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent triggering card click
    setDeleteRecordId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteRecordId) {
      deleteMutation.mutate(deleteRecordId);
    }
  };

  // Get all media items from record (new format or backward compatibility)
  const getMediaItems = (record) => {
    if (record.media && record.media.length > 0) {
      return record.media;
    }
    if (record.mediaUrl) {
      return [{ url: record.mediaUrl, type: record.mediaType }];
    }
    return [];
  };

  const handleCardClick = (record) => {
    setPreviewRecord(record);
    setCurrentMediaIndex(0); // Reset to first media when opening
  };

  const handleClosePreview = () => {
    setPreviewRecord(null);
    setCurrentMediaIndex(0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd", { locale: zhCN });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.dashboardContainer}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: "white", fontWeight: 600 }}
          >
            {t("管理記錄")}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            {t("新增記錄")}
          </Button>
        </Box>

        {isLoading ? (
          <Typography variant="body1" sx={{ color: "white" }}>{t("加載中...")}</Typography>
        ) : records.length === 0 ? (
          <Card
            sx={{
              backgroundColor: "rgba(26, 31, 58, 0.6)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {t("暫無記錄")}
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2.5 }}>
            {records.map((record) => (
              <Grid item xs={4} sm={4} md={3} lg={2} xl={2} key={record._id}>
                <Card
                  onClick={() => handleCardClick(record)}
                  sx={{
                    backgroundColor: "rgba(26, 31, 58, 0.6)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "rgba(50, 205, 50, 0.3)",
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                      transform: "scale(1.02)",
                    },
                    position: "relative",
                  }}
                >
                  <IconButton
                    onClick={(e) => handleDeleteClick(e, record._id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: "rgba(255, 71, 87, 0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 71, 87, 1)",
                      },
                    }}
                  >
                    <DeleteIcon sx={{ color: "white" }} />
                  </IconButton>

                  {(record.media && record.media.length > 0) || record.mediaUrl ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: { xs: "120px", sm: "150px", md: "180px", lg: "200px" },
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: "#1a1a1a",
                      }}
                    >
                      {(() => {
                        // Use new media array format or fallback to old format
                        const mediaItem = record.media && record.media.length > 0
                          ? record.media[0] // Show first media item
                          : record.mediaUrl
                          ? { url: record.mediaUrl, type: record.mediaType }
                          : null;

                        if (!mediaItem) return null;

                        return mediaItem.type === "video" ? (
                          <video
                            src={mediaItem.url}
                            controls
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <img
                            src={mediaItem.url}
                            alt={record.text}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%231a1a1a' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        );
                      })()}
                      {record.media && record.media.length > 1 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            backgroundColor: "rgba(50, 205, 50, 0.8)",
                            color: "white",
                            borderRadius: "12px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          +{record.media.length - 1}
                        </Box>
                      )}
                    </Box>
                  ) : null}

                  <CardContent>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#32cd32",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      {formatDate(record.date)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.9)",
                        wordBreak: "break-word",
                      }}
                    >
                      {record.text}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ color: "white" }}>{t("新增記錄")}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label={t("日期")}
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label={t("文字內容")}
                multiline
                rows={4}
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                fullWidth
                required
              />
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    mb: 2,
                    borderColor: "rgba(50, 205, 50, 0.5)",
                    color: "#32cd32",
                    "&:hover": {
                      borderColor: "#32cd32",
                      backgroundColor: "rgba(50, 205, 50, 0.1)",
                    },
                  }}
                >
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} ${t("個檔案已選擇")}`
                    : t("選擇照片或影片（可多選）")}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {filePreviews.length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    {filePreviews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <IconButton
                          onClick={() => handleRemoveFile(index)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            backgroundColor: "rgba(255, 71, 87, 0.8)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 71, 87, 1)",
                            },
                          }}
                        >
                          <DeleteIcon sx={{ color: "white", fontSize: "18px" }} />
                        </IconButton>
                        {preview.type === "image" ? (
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        ) : (
                          <video
                            src={preview.url}
                            controls
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              display: "block",
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            p: 1,
                            color: "rgba(255, 255, 255, 0.7)",
                            textAlign: "center",
                          }}
                        >
                          {preview.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: "white" }}>
              {t("取消")}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? t("創建中...") : t("創建")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
        >
          <DialogTitle sx={{ color: "white" }}>{t("確認刪除")}</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "white" }}>
              {t("您確定要刪除此記錄嗎？此操作無法復原。")}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)} sx={{ color: "white" }}>
              {t("取消")}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? t("刪除中...") : t("刪除")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={!!previewRecord}
          onClose={handleClosePreview}
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
          {previewRecord && (() => {
            const mediaItems = getMediaItems(previewRecord);
            const currentMedia = mediaItems[currentMediaIndex];

            return (
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
                  onClick={handleClosePreview}
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
                {mediaItems.length > 0 && (
                  <Box
                    sx={{
                      width: "100%",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#000",
                      padding: { xs: 2, sm: 4 },
                      position: "relative",
                    }}
                  >
                    {/* Navigation arrows */}
                    {mediaItems.length > 1 && (
                      <>
                        <IconButton
                          onClick={() =>
                            setCurrentMediaIndex(
                              currentMediaIndex === 0
                                ? mediaItems.length - 1
                                : currentMediaIndex - 1
                            )
                          }
                          sx={{
                            position: "absolute",
                            left: 16,
                            zIndex: 1000,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                          }}
                        >
                          <ArrowBackIosIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            setCurrentMediaIndex(
                              currentMediaIndex === mediaItems.length - 1
                                ? 0
                                : currentMediaIndex + 1
                            )
                          }
                          sx={{
                            position: "absolute",
                            right: 16,
                            zIndex: 1000,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                            },
                          }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                        {/* Media counter */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            borderRadius: "12px",
                            padding: "4px 12px",
                            fontSize: "14px",
                            zIndex: 1000,
                          }}
                        >
                          {currentMediaIndex + 1} / {mediaItems.length}
                        </Box>
                      </>
                    )}

                    {/* Current media */}
                    {currentMedia && (
                      <>
                        {currentMedia.type === "video" ? (
                          <video
                            key={currentMedia.url}
                            src={currentMedia.url}
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
                            key={currentMedia.url}
                            src={currentMedia.url}
                            alt={previewRecord.text}
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
                      </>
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
                    {formatDate(previewRecord.date)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      wordBreak: "break-word",
                    }}
                  >
                    {previewRecord.text}
                  </Typography>
                </Box>
              </Box>
            );
          })()}
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
};

export default ManageRecords;

