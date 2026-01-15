import React, { useEffect, useState } from "react";
import styles from "./ManageMembers.module.scss";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import useGetAllMembers from "../../hooks/useGetAllMembers";
import MemberTable from "./MemberTable";
import { api } from "../../utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const ManageMembers = () => {
  const { t } = useTranslation();
  const { data: members, isLoading, error } = useGetAllMembers();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const queryClient = useQueryClient();
  const [memberList, setMemberList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const usernameRef = React.useRef();
  const passwordRef = React.useRef();
  const priceRef = React.useRef();
  const dateRef = React.useRef();
  const [dialogError, setDialogError] = useState(null);
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [editCredentialOpen, setEditCredentialOpen] = useState(false);
  const [editMember, setEditMember] = useState({
    id: null,
    username: "",
    password: "",
    price: "",
  });
  const editUsernameRef = React.useRef();
  const editPasswordRef = React.useRef();
  const editPriceRef = React.useRef();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState(null);
  const { userRole } = useAuthStore();

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
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
            background: "rgba(26, 31, 58, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: "rgba(26, 31, 58, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.9)",
          },
          head: {
            backgroundColor: "rgba(50, 205, 50, 0.1)",
            color: "rgba(255, 255, 255, 0.95)",
            fontWeight: 600,
            fontSize: "0.95rem",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: "rgba(50, 205, 50, 0.08)",
            },
            "&:nth-of-type(even)": {
              backgroundColor: "rgba(255, 255, 255, 0.02)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(50, 205, 50, 0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#32cd32",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-focused": {
                color: "#32cd32",
              },
            },
            "& .MuiInputBase-input": {
              color: "rgba(255, 255, 255, 0.9)",
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    if (members) {
      setMemberList(members);
    }
  }, [members]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const blockMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/members/${id}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      setSnackbarMessage(t("會員封鎖成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error("Error blocking member:", error);
      setSnackbarMessage(t("封鎖會員時出錯"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/members/${id}/unblock`),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      setSnackbarMessage(t("會員解除封鎖成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error("Error unblocking member:", error);
      setSnackbarMessage(t("解除封鎖會員時出錯"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const handleBlockMember = (id) => {
    blockMutation.mutate(id);
  };

  const handleUnblockMember = (id) => {
    unblockMutation.mutate(id);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Clear the input values when closing the dialog
    if (usernameRef.current) {
      usernameRef.current.value = "";
    }
    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
    if (priceRef.current) {
      priceRef.current.value = "";
    }
    if (dateRef.current) {
      dateRef.current.value = "";
    }
    setDialogError(null);
  };

  const addMutation = useMutation({
    mutationFn: (newMember) => api.post("/admin/register-member", newMember),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      handleCloseDialog();
      setSnackbarMessage(t("會員新增成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      if (error.response && error.response.status === 400) {
        setDialogError(t("用戶名已存在"));
      } else {
        setDialogError(error.message);
      }
    },
  });

  const handleAddMember = async () => {
    const newMember = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
      price: priceRef.current.value,
      date: dateRef.current.value ? new Date(dateRef.current.value) : null,
      createdBy: userRole === "main" ? "main" : "sub",
    };
     if (!newMember.date) {
       setDialogError(t("日期是必填欄位"));
       return;
     }
    addMutation.mutate(newMember);
  };

  const handleEditPriceOpen = (member) => {
    setEditMember({
      id: member._id,
      username: member.username,
      password: "",
      price: member.price,
    });
    setEditPriceOpen(true);
    // Set the initial values of the refs when the dialog opens
    setTimeout(() => {
      if (editPriceRef.current) {
        editPriceRef.current.value = member.price;
      }
    }, 0);
  };

  const handleEditPriceClose = () => {
    setEditPriceOpen(false);
    setEditMember({ id: null, username: "", password: "", price: "" });
  };

  const handleEditCredentialOpen = (member) => {
    setEditMember({
      id: member._id,
      username: member.username,
      password: "",
      price: member.price,
    });
    setEditCredentialOpen(true);
    // Set the initial values of the refs when the dialog opens
    setTimeout(() => {
      if (editUsernameRef.current) {
        editUsernameRef.current.value = member.username;
      }
      if (editPasswordRef.current) {
        editPasswordRef.current.value = ""; // Or member.password if you want to show the existing password
      }
    }, 0);
  };

  const handleEditCredentialClose = () => {
    setEditCredentialOpen(false);
    setEditMember({ id: null, username: "", password: "", price: "" });
  };

  const handleEditMemberPrice = async () => {
    try {
      await api.put(`/admin/members/${editMember.id}`, {
        price: editPriceRef.current.value,
      });
      queryClient.invalidateQueries(["members"]);
      handleEditPriceClose();
      setSnackbarMessage(t("會員編輯成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating member:", err);
    }
  };

  const handleEditMemberCredential = async () => {
    try {
      await api.put(`/admin/members/${editMember.id}`, {
        username: editUsernameRef.current.value,
        password: editPasswordRef.current.value,
      });
      queryClient.invalidateQueries(["members"]);
      handleEditCredentialClose();
      setSnackbarMessage(t("會員編輯成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating member:", err);
    }
  };

  const handleDeleteMemberOpen = (member) => {
    setDeleteMemberId(member._id);
    setDeleteOpen(true);
  };

  const handleDeleteMemberClose = () => {
    setDeleteOpen(false);
    setDeleteMemberId(null);
  };

  const immuneMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/members/${id}/toggle-immune`),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      setSnackbarMessage(t("會員免疫狀態更新成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error("Error updating immunity:", error);
      setSnackbarMessage(t("更新免疫狀態時出錯"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const handleToggleImmune = (id) => {
    immuneMutation.mutate(id);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
      handleDeleteMemberClose();
      setSnackbarMessage(t("會員刪除成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error("Error deleting member:", error);
      setSnackbarMessage(t("刪除會員時出錯"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    },
  });

  const handleDeleteMember = async () => {
    deleteMutation.mutate(deleteMemberId);
  };

  const handlePriceChange = (event) => {
    const { value } = event.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    priceRef.current.value = numericValue;
  };

  return (
    <div className={styles.manageMembersContainer}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
        sx={{ 
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          className={styles.manageMembersTitle}
          style={{ color: "white" }}
          sx={{ 
            mb: 0,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          {t("管理會員")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            width: { xs: "100%", sm: "auto" },
            background: "linear-gradient(135deg, #32cd32 0%, #28a428 100%)",
            borderRadius: "12px",
            padding: { xs: "12px 24px", sm: "10px 24px" },
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(50, 205, 50, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #28a428 0%, #32cd32 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(50, 205, 50, 0.4)",
            },
            "& .MuiButton-startIcon": {
              marginRight: { xs: "8px", sm: "8px" },
            },
          }}
        >
          {t("新增")}
        </Button>
      </Box>
      {isLoading
        ? <Typography>{t("Loading...")}</Typography>
        : error
        ? <Typography color="error">{error.message}</Typography>
        : (
          <ThemeProvider theme={darkTheme}>
            <Paper
              sx={{
                backgroundColor: "rgba(26, 31, 58, 0.6)",
                backdropFilter: "blur(10px)",
                color: "white",
                padding: { xs: "16px", sm: "20px", md: "24px" },
                margin: 0,
                width: "100%",
                borderRadius: { xs: "16px", sm: "20px" },
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                overflow: "hidden",
              }}
            >
              <Box sx={{ 
                overflowX: { xs: "visible", md: "auto" },
                overflowY: "visible",
              }}>
                <MemberTable
                  members={memberList}
                  handleBlockMember={handleBlockMember}
                  handleUnblockMember={handleUnblockMember}
                  handleEditPriceOpen={handleEditPriceOpen}
                  handleEditCredentialOpen={handleEditCredentialOpen}
                  handleDeleteMemberOpen={handleDeleteMemberOpen}
                  handleToggleImmune={handleToggleImmune}
                />
              </Box>
            </Paper>
          </ThemeProvider>
        )}
      <ThemeProvider theme={darkTheme}>
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              background: "rgba(26, 31, 58, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: { xs: "16px", sm: "20px" },
              border: "1px solid rgba(255, 255, 255, 0.1)",
              margin: { xs: "16px", sm: "32px" },
              width: { xs: "calc(100% - 32px)", sm: "auto" },
            }
          }}
        >
          <DialogTitle sx={{ 
            color: "rgba(255, 255, 255, 0.9)", 
            fontSize: { xs: "1.25rem", sm: "1.5rem" }, 
            fontWeight: 600,
            padding: { xs: "20px 20px 16px", sm: "24px 24px 20px" },
          }}>
            {t("新增會員")}
          </DialogTitle>
        <DialogContent
          sx={{
            padding: { xs: "16px 20px", sm: "20px 24px" },
            display: "flex",
            flexDirection: "column",
            gap: { xs: "12px", sm: "16px" },
          }}
        >
          <TextField
            autoFocus
            sx={{ mt: 2 }}
            label={t("用戶名")}
            type="text"
            fullWidth
            name="username"
            inputRef={usernameRef}
            autoComplete="off"
          />
          <TextField
            inputRef={passwordRef}
            label={t("密碼")}
            type="password"
            fullWidth
            name="password"
            autoComplete="new-password"
          />
          <TextField
            inputRef={priceRef}
            label={t("價格")}
            type="text"
            fullWidth
            name="price"
            autoComplete="off"
            onChange={handlePriceChange}
          />
          <TextField
            inputRef={dateRef}
            label={t("Date")}
            type="date"
            fullWidth
            name="date"
            autoComplete="off"
            InputLabelProps={{
              shrink: true,
            }}
          />
          {dialogError && <p className="error-message">{dialogError}</p>}
        </DialogContent>
        <DialogActions sx={{
          padding: { xs: "16px 20px 20px", sm: "20px 24px 24px" },
          gap: { xs: 1, sm: 2 },
        }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
            {t("取消")}
          </Button>
          <Button
            onClick={handleAddMember}
            color="primary"
            disabled={addMutation.isLoading}
            variant="contained"
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
              borderRadius: "12px",
            }}
          >
            {addMutation.isLoading ? t("載入中...") : t("新增")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editPriceOpen}
        onClose={handleEditPriceClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "rgba(26, 31, 58, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: { xs: "16px", sm: "20px" },
            border: "1px solid rgba(255, 255, 255, 0.1)",
            margin: { xs: "16px", sm: "32px" },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          }
        }}
      >
        <DialogTitle sx={{ 
          color: "rgba(255, 255, 255, 0.9)", 
          fontSize: { xs: "1.25rem", sm: "1.5rem" }, 
          fontWeight: 600,
          padding: { xs: "20px 20px 16px", sm: "24px 24px 20px" },
        }}>
          {t("編輯會員")}
        </DialogTitle>
        <DialogContent
          sx={{
            padding: { xs: "16px 20px", sm: "20px 24px" },
            display: "flex",
            flexDirection: "column",
            gap: { xs: "12px", sm: "16px" },
          }}
        >
          <TextField
            inputRef={editPriceRef}
            label={t("價格")}
            type="number"
            fullWidth
            name="price"
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions sx={{
          padding: { xs: "16px 20px 20px", sm: "20px 24px 24px" },
          gap: { xs: 1, sm: 2 },
        }}>
          <Button 
            onClick={handleEditPriceClose}
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
            {t("取消")}
          </Button>
          <Button 
            onClick={handleEditMemberPrice} 
            color="primary"
            variant="contained"
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
              borderRadius: "12px",
            }}
          >
            {t("儲存")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editCredentialOpen}
        onClose={handleEditCredentialClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "rgba(26, 31, 58, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: { xs: "16px", sm: "20px" },
            border: "1px solid rgba(255, 255, 255, 0.1)",
            margin: { xs: "16px", sm: "32px" },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          }
        }}
      >
        <DialogTitle sx={{ 
          color: "rgba(255, 255, 255, 0.9)", 
          fontSize: { xs: "1.25rem", sm: "1.5rem" }, 
          fontWeight: 600,
          padding: { xs: "20px 20px 16px", sm: "24px 24px 20px" },
        }}>
          {t("編輯會員")}
        </DialogTitle>
        <DialogContent
          sx={{
            padding: { xs: "16px 20px", sm: "20px 24px" },
            display: "flex",
            flexDirection: "column",
            gap: { xs: "12px", sm: "16px" },
          }}
        >
          <TextField
            inputRef={editUsernameRef}
            autoFocus
            sx={{ mt: 2 }}
            label={t("用戶名")}
            type="text"
            fullWidth
            name="username"
          />
          <TextField
            inputRef={editPasswordRef}
            label={t("密碼")}
            type="password"
            fullWidth
            name="password"
            autoComplete="new-password"
          />
        </DialogContent>
        <DialogActions sx={{
          padding: { xs: "16px 20px 20px", sm: "20px 24px 24px" },
          gap: { xs: 1, sm: 2 },
        }}>
          <Button 
            onClick={handleEditCredentialClose}
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
            {t("取消")}
          </Button>
          <Button 
            onClick={handleEditMemberCredential} 
            color="primary"
            variant="contained"
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
              borderRadius: "12px",
            }}
          >
            {t("儲存")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog 
        open={deleteOpen} 
        onClose={handleDeleteMemberClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background: "rgba(26, 31, 58, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: { xs: "16px", sm: "20px" },
            border: "1px solid rgba(255, 255, 255, 0.1)",
            margin: { xs: "16px", sm: "32px" },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          }
        }}
      >
        <DialogTitle sx={{ 
          color: "rgba(255, 255, 255, 0.9)", 
          fontSize: { xs: "1.25rem", sm: "1.5rem" }, 
          fontWeight: 600,
          padding: { xs: "20px 20px 16px", sm: "24px 24px 20px" },
        }}>
          {t("刪除會員")}
        </DialogTitle>
        <DialogContent sx={{
          padding: { xs: "16px 20px", sm: "20px 24px" },
        }}>
          <Typography sx={{ 
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: { xs: "14px", sm: "16px" },
          }}>
            {t("確定要刪除此會員嗎？")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          padding: { xs: "16px 20px 20px", sm: "20px 24px 24px" },
          gap: { xs: 1, sm: 2 },
        }}>
          <Button 
            onClick={handleDeleteMemberClose}
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
            {t("取消")}
          </Button>
          <Button
            onClick={handleDeleteMember}
            color="error"
            disabled={deleteMutation.isLoading}
            variant="contained"
            sx={{
              textTransform: "none",
              padding: { xs: "8px 16px", sm: "10px 24px" },
              fontSize: { xs: "14px", sm: "16px" },
              borderRadius: "12px",
            }}
          >
            {deleteMutation.isLoading ? t("刪除中...") : t("刪除")}
          </Button>
        </DialogActions>
      </Dialog>
      </ThemeProvider>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ManageMembers;
