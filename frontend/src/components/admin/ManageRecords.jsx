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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { api } from "../../utils/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const ManageRecords = () => {
  const { t } = useTranslation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    text: "",
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);

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
      if (data.file) {
        formDataToSend.append("media", data.file);
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
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ date: "", text: "" });
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview({ type: "image", url: reader.result });
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview({ type: "video", url: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.text) {
      setSnackbarMessage(t("請填寫所有必填欄位"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    createMutation.mutate({
      date: formData.date,
      text: formData.text,
      file: selectedFile,
    });
  };

  const handleDeleteClick = (id) => {
    setDeleteRecordId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteRecordId) {
      deleteMutation.mutate(deleteRecordId);
    }
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
          <Typography sx={{ color: "white" }}>{t("加載中...")}</Typography>
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
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {t("暫無記錄")}
            </Typography>
          </Card>
        ) : (
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
                    "&:hover": {
                      borderColor: "rgba(50, 205, 50, 0.3)",
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                    },
                    position: "relative",
                  }}
                >
                  <IconButton
                    onClick={() => handleDeleteClick(record._id)}
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

                  {record.mediaUrl && (
                    <Box
                      sx={{
                        width: "100%",
                        height: "200px",
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
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%231a1a1a' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image: ${record.mediaUrl}`);
                          }}
                        />
                      )}
                    </Box>
                  )}

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
                  {selectedFile ? selectedFile.name : t("選擇照片或影片")}
                  <input
                    type="file"
                    hidden
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {filePreview && (
                  <Box sx={{ mt: 2 }}>
                    {filePreview.type === "image" ? (
                      <img
                        src={filePreview.url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "300px",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <video
                        src={filePreview.url}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "300px",
                          borderRadius: "8px",
                        }}
                      />
                    )}
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

