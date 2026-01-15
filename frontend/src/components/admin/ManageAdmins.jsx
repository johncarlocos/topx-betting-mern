import React, { useEffect, useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import useRegisterSubAdmin from "../../hooks/useRegisterSubAdmin";
import styles from "./ManageAdmins.module.scss";
import { api } from "../../utils/api";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useGetAllSubAdmins from "../../hooks/useGetAllSubAdmins";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ManageAdmins = () => {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const usernameRef = React.useRef();
  const passwordRef = React.useRef();
  const { mutate, isLoading, error } = useRegisterSubAdmin();
  const [dialogError, setDialogError] = useState(null);
  const editUsernameRef = React.useRef();
  const editPasswordRef = React.useRef();
  const {
    data: subAdmins,
    isLoading: isSubAdminsLoading,
    error: subAdminsError,
  } = useGetAllSubAdmins();
  const [editOpen, setEditOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState({
    id: null,
    username: "",
    password: "",
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const queryClient = useQueryClient();

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
    if (subAdmins) {
      setAdmins(subAdmins);
    }
  }, [subAdmins]);

  const fetchAdmins = async () => {
    try {
      const response = await api.get("/admin/members");
      setAdmins(response.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
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
    setDialogError(null);
  };

  const addMutation = useMutation({
    mutationFn: (newAdmin) => api.post("/admin/register-subadmin", newAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries(["subadmins"]);
      handleCloseDialog();
      setSnackbarMessage(t("管理員新增成功"));
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

  const handleAddAdmin = async () => {
    const newAdmin = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    };
    addMutation.mutate(newAdmin);
  };

  const handleEditOpen = (admin) => {
    setEditAdmin({ id: admin._id, username: admin.username, password: "" });
    setEditOpen(true);
    // Set the initial values of the refs when the dialog opens
    setTimeout(() => {
      if (editUsernameRef.current) {
        editUsernameRef.current.value = admin.username;
      }
      if (editPasswordRef.current) {
        editPasswordRef.current.value = ""; // Or admin.password if you want to show the existing password
      }
    }, 0);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditAdmin({ id: null, username: "", password: "" });
  };

  const handleEditAdmin = async () => {
    try {
      await api.put(`/admin/subadmins/${editAdmin.id}`, {
        username: editUsernameRef.current.value,
        password: editPasswordRef.current.value,
      });
      queryClient.invalidateQueries(["subadmins"]);
      handleEditClose();
      setSnackbarMessage(t("管理員編輯成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating admin:", err);
    }
  };

  const handleDeleteOpen = (id) => {
    setDeleteAdminId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeleteAdminId(null);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/subadmins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["subadmins"]);
      handleDeleteClose();
      setSnackbarMessage(t("管理員刪除成功"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error("Error deleting admin:", error);
    },
  });

  const handleDeleteAdmin = async () => {
    deleteMutation.mutate(deleteAdminId);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const columns = useMemo(
    () => [
      {
        header: t("用戶名"),
        accessorKey: "username",
      },
      {
        header: t("角色"),
        accessorKey: "role",
      },
      {
        header: t("操作"),
        cell: (props) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title={t("編輯")}>
              <IconButton
                aria-label="edit"
                onClick={() => handleEditOpen(props.row.original)}
              >
                <EditIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("刪除")}>
              <IconButton
                aria-label="delete"
                onClick={() => handleDeleteOpen(props.row.original._id)}
              >
                <DeleteIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        size: 100,
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: admins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={styles.manageAdminsContainer}>
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
          className={styles.manageAdminsTitle}
          style={{ color: "white" }}
          sx={{ 
            mb: 0,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          {t("管理管理員")}
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
          }}
        >
          {t("新增管理員")}
        </Button>
      </Box>
      <Card
        sx={{
          backgroundColor: "rgba(26, 31, 58, 0.6)",
          backdropFilter: "blur(10px)",
          color: "white",
          borderRadius: { xs: "16px", sm: "20px" },
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <CardContent sx={{ padding: { xs: "16px", sm: "20px", md: "24px" } }}>
          <ThemeProvider theme={darkTheme}>
            <div style={{ overflowX: "auto" }}>
              <TableContainer
                component={Paper}
                sx={{
                  margin: "0",
                  width: "100%",
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "& .MuiTable-root": {
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                  },
                }}
              >
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow 
                        key={headerGroup.id}
                        sx={{
                          "& .MuiTableCell-head": {
                            backgroundColor: "rgba(50, 205, 50, 0.15)",
                            borderBottom: "2px solid rgba(50, 205, 50, 0.3)",
                          },
                        }}
                      >
                        {headerGroup.headers.map((header) => (
                          <TableCell
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            sx={{
                              cursor: "pointer",
                              userSelect: "none",
                              transition: "all 0.2s ease",
                              fontSize: { xs: "13px", sm: "14px", md: "15px" },
                              padding: { xs: "12px 8px", sm: "14px 12px", md: "16px" },
                              "&:hover": {
                                backgroundColor: "rgba(50, 205, 50, 0.2)",
                              },
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: " ⬆️",
                              desc: " ⬇️",
                            }[header.column.getIsSorted()]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row, index) => (
                      <TableRow 
                        key={row.id}
                        sx={{
                          backgroundColor: index % 2 === 0 
                            ? "rgba(255, 255, 255, 0.03)" 
                            : "rgba(255, 255, 255, 0.05)",
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(50, 205, 50, 0.12)",
                            transform: "translateX(4px)",
                            boxShadow: "0 4px 12px rgba(50, 205, 50, 0.2)",
                          },
                          "& .MuiTableCell-root": {
                            borderBottom: "none",
                            padding: "16px",
                          },
                          "& .MuiTableCell-root:first-of-type": {
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                          },
                          "& .MuiTableCell-root:last-of-type": {
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                          },
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            sx={{ 
                              whiteSpace: cell.column.id === "操作" ? "normal" : "nowrap",
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: { xs: "12px", sm: "13px", md: "14px" },
                              padding: { xs: "12px 8px", sm: "14px 12px", md: "16px" },
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <Box
              mt={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {t("上一頁")}
              </Button>
              <span>
                {t("第")} {table.getState().pagination.pageIndex + 1} {t("頁")}
                {" "}
                {t("共")} {table.getPageCount()} {t("頁")}
              </span>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {t("下一頁")}
              </Button>
            </Box>
          </ThemeProvider>
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
                {t("新增管理員")}
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
                  label={t("用戶名")}
                  type="text"
                  fullWidth
                  name="username"
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
                  onClick={handleAddAdmin}
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
              open={editOpen}
              onClose={handleEditClose}
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
                {t("編輯管理員")}
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
                  onClick={handleEditClose}
                  sx={{
                    textTransform: "none",
                    padding: { xs: "8px 16px", sm: "10px 24px" },
                    fontSize: { xs: "14px", sm: "16px" },
                  }}
                >
                  {t("取消")}
                </Button>
                <Button 
                  onClick={handleEditAdmin} 
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
              onClose={handleDeleteClose}
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
                {t("刪除管理員")}
              </DialogTitle>
              <DialogContent sx={{
                padding: { xs: "16px 20px", sm: "20px 24px" },
              }}>
                <Typography sx={{ 
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: { xs: "14px", sm: "16px" },
                }}>
                  {t("確定要刪除此管理員嗎？")}
                </Typography>
              </DialogContent>
              <DialogActions sx={{
                padding: { xs: "16px 20px 20px", sm: "20px 24px 24px" },
                gap: { xs: 1, sm: 2 },
              }}>
                <Button 
                  onClick={handleDeleteClose}
                  sx={{
                    textTransform: "none",
                    padding: { xs: "8px 16px", sm: "10px 24px" },
                    fontSize: { xs: "14px", sm: "16px" },
                  }}
                >
                  {t("取消")}
                </Button>
                <Button
                  onClick={handleDeleteAdmin}
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
        </CardContent>
      </Card>
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
      {subAdminsError && (
        <Typography variant="body2" color="error" mt={2}>
          {subAdminsError.message}
        </Typography>
      )}
    </div>
  );
};

export default ManageAdmins;
