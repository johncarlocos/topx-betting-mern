import React, { useCallback, useMemo, useState } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useAuthStore from "../../store/authStore";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const MemberTable = ({
  members,
  handleBlockMember,
  handleUnblockMember,
  handleEditPriceOpen,
  handleEditCredentialOpen,
  handleDeleteMemberOpen,
  handleToggleImmune,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { userRole } = useAuthStore();

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setGlobalFilter(value);
    }, 300),
    [],
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  const { t } = useTranslation();

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          header: t("用戶名"),
          accessorKey: "username",
        },
        {
          header: t("價格"),
          accessorKey: "price",
        },
        {
          header: t("Date"),
          accessorKey: "date",
          cell: (props) => {
            const date = props.getValue();
            const formattedDate = format(new Date(date), "yyyy年M月d日(E)", {
              locale: zhCN,
            });
            return formattedDate;
          },
        },
        {
          header: t("識別碼"),
          accessorKey: "slug",
          cell: (props) => props.getValue(),
        },
      ];

      if (userRole === "main") {
        baseColumns.push({
          header: t("創建者"),
          accessorKey: "createdBy.username",
          cell: (props) => {
            const createdBy = props.row.original.createdBy;
            const role = createdBy?.role;
            const username = createdBy?.username;
            const translatedRole = role === "main"
              ? t("main_admin")
              : t("sub_admin");
            return `${translatedRole} (${username})`;
          },
        });
      }

      baseColumns.push({
        header: t("操作"),
        cell: (props) => (
          <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, flexWrap: "wrap" }}>
            <Tooltip title={t("編輯")}>
              <IconButton
                aria-label="edit"
                onClick={() => handleEditCredentialOpen(props.row.original)}
                sx={{
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    backgroundColor: "rgba(50, 205, 50, 0.2)",
                  },
                }}
              >
                <EditIcon sx={{ fontSize: { xs: "18px", sm: "20px" } }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("編輯價格")}>
              <IconButton
                aria-label="edit-price"
                onClick={() => handleEditPriceOpen(props.row.original)}
                sx={{
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    backgroundColor: "rgba(50, 205, 50, 0.2)",
                  },
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: { xs: "18px", sm: "20px" } }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("刪除")}>
              <IconButton
                aria-label="delete"
                onClick={() => handleDeleteMemberOpen(props.row.original)}
                sx={{
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    backgroundColor: "rgba(255, 71, 87, 0.2)",
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: { xs: "18px", sm: "20px" } }} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={props.row.original.blocked ? t("解除封鎖") : t("封鎖")}
            >
              <IconButton
                aria-label={props.row.original.blocked
                  ? t("解除封鎖")
                  : t("封鎖")}
                onClick={() =>
                  props.row.original.blocked
                    ? handleUnblockMember(props.row.original._id)
                    : handleBlockMember(props.row.original._id)}
                sx={{
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    backgroundColor: props.row.original.blocked 
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(244, 67, 54, 0.2)",
                  },
                }}
              >
                {props.row.original.blocked
                  ? (
                    <CheckCircleIcon
                      sx={{ fontSize: { xs: "18px", sm: "20px" }, color: "#4caf50" }}
                    />
                  )
                  : <BlockIcon sx={{ fontSize: { xs: "18px", sm: "20px" }, color: "#f44336" }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title={props.row.original.immuneToIPBan ? t("撤銷IP封鎖免疫") : t("授予IP封鎖免疫")}>
              <IconButton
                aria-label="toggle-immune"
                onClick={() => handleToggleImmune(props.row.original._id)}
                sx={{
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    backgroundColor: "rgba(50, 205, 50, 0.2)",
                  },
                }}
              >
                <VerifiedIcon sx={{ 
                  fontSize: { xs: "18px", sm: "20px" },
                  color: props.row.original.immuneToIPBan ? "#4caf50" : "rgba(255,255,255,0.5)"
                }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        size: 100,
      });
      return baseColumns;
    },
    [
      t,
      handleBlockMember,
      handleUnblockMember,
      handleEditPriceOpen,
      handleEditCredentialOpen,
      handleDeleteMemberOpen,
      userRole,
    ],
  );

  const table = useReactTable({
    data: members,
    columns,
    initialState: {
      sorting: [{ id: "date", desc: true }],
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <Box 
        mb={3} 
        sx={{ 
          mt: { xs: 2, sm: 4 },
          px: { xs: 0, sm: 0 },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label={t("搜索會員")}
          placeholder={t("輸入關鍵字搜尋...")}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              transition: "all 0.3s ease",
              fontSize: { xs: "14px", sm: "16px" },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: { xs: "14px", sm: "16px" },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(50, 205, 50, 0.5)",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#32cd32",
              borderWidth: "2px",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#32cd32",
            },
            "& .MuiInputBase-input": {
              color: "rgba(255, 255, 255, 0.9)",
            },
          }}
        />
      </Box>

      {/* Desktop Table View */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer 
          component={Paper}
          sx={{
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
                      whiteSpace: cell.column.id === "操作" ? "normal" : 'nowrap',
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: { xs: "12px", sm: "13px", md: "14px" },
                      padding: { xs: "12px 8px", sm: "14px 12px", md: "16px" },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {table.getRowModel().rows.map((row, index) => {
          const member = row.original;
          return (
            <Paper
              key={row.id}
              sx={{
                backgroundColor: index % 2 === 0 
                  ? "rgba(255, 255, 255, 0.03)" 
                  : "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(50, 205, 50, 0.12)",
                  borderColor: "rgba(50, 205, 50, 0.3)",
                  boxShadow: "0 4px 12px rgba(50, 205, 50, 0.2)",
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", mb: 0.5 }}>
                    {t("用戶名")}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "16px", fontWeight: 600 }}>
                    {member.username}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 }, flexWrap: "wrap" }}>
                  <Tooltip title={t("編輯")}>
                    <IconButton
                      aria-label="edit"
                      onClick={() => handleEditCredentialOpen(member)}
                      size="small"
                      sx={{
                        padding: "6px",
                        "&:hover": {
                          backgroundColor: "rgba(50, 205, 50, 0.2)",
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("編輯價格")}>
                    <IconButton
                      aria-label="edit-price"
                      onClick={() => handleEditPriceOpen(member)}
                      size="small"
                      sx={{
                        padding: "6px",
                        "&:hover": {
                          backgroundColor: "rgba(50, 205, 50, 0.2)",
                        },
                      }}
                    >
                      <AttachMoneyIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("刪除")}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteMemberOpen(member)}
                      size="small"
                      sx={{
                        padding: "6px",
                        "&:hover": {
                          backgroundColor: "rgba(255, 71, 87, 0.2)",
                        },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={member.blocked ? t("解除封鎖") : t("封鎖")}>
                    <IconButton
                      aria-label={member.blocked ? t("解除封鎖") : t("封鎖")}
                      onClick={() =>
                        member.blocked
                          ? handleUnblockMember(member._id)
                          : handleBlockMember(member._id)}
                      size="small"
                      sx={{
                        padding: "6px",
                        "&:hover": {
                          backgroundColor: member.blocked 
                            ? "rgba(76, 175, 80, 0.2)"
                            : "rgba(244, 67, 54, 0.2)",
                        },
                      }}
                    >
                      {member.blocked
                        ? <CheckCircleIcon sx={{ fontSize: "18px", color: "#4caf50" }} />
                        : <BlockIcon sx={{ fontSize: "18px", color: "#f44336" }} />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={member.immuneToIPBan ? t("撤銷IP封鎖免疫") : t("授予IP封鎖免疫")}>
                    <IconButton
                      aria-label="toggle-immune"
                      onClick={() => handleToggleImmune(member._id)}
                      size="small"
                      sx={{
                        padding: "6px",
                        "&:hover": {
                          backgroundColor: "rgba(50, 205, 50, 0.2)",
                        },
                      }}
                    >
                      <VerifiedIcon sx={{ 
                        fontSize: "18px",
                        color: member.immuneToIPBan ? "#4caf50" : "rgba(255,255,255,0.5)"
                      }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", mb: 0.5 }}>
                    {t("價格")}
                  </Typography>
                  <Typography sx={{ color: "#32cd32", fontSize: "14px", fontWeight: 600 }}>
                    {member.price}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", mb: 0.5 }}>
                    {t("識別碼")}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "12px", fontFamily: "monospace" }}>
                    {member.slug}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", mb: 0.5 }}>
                  {t("Date")}
                </Typography>
                <Typography sx={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px" }}>
                  {format(new Date(member.date), "yyyy年M月d日(E)", { locale: zhCN })}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Pagination */}
      <Box
        mt={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        sx={{
          px: { xs: 1, sm: 0 },
        }}
      >
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            padding: { xs: "8px 16px", sm: "10px 24px" },
            fontSize: { xs: "12px", sm: "14px" },
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "rgba(255, 255, 255, 0.8)",
            textTransform: "none",
            minWidth: { xs: "80px", sm: "100px" },
            "&:hover": {
              borderColor: "#32cd32",
              backgroundColor: "rgba(50, 205, 50, 0.1)",
            },
            "&:disabled": {
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          {t("上一頁")}
        </Button>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: { xs: "12px", sm: "14px" },
            fontWeight: 500,
          }}
        >
          {t("第")} <span style={{ color: "#32cd32", fontWeight: 600 }}>{table.getState().pagination.pageIndex + 1}</span> {t("頁")}
          {" / "}
          {t("共")} <span style={{ color: "#32cd32", fontWeight: 600 }}>{table.getPageCount()}</span> {t("頁")}
        </Typography>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            padding: { xs: "8px 16px", sm: "10px 24px" },
            fontSize: { xs: "12px", sm: "14px" },
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "rgba(255, 255, 255, 0.8)",
            textTransform: "none",
            minWidth: { xs: "80px", sm: "100px" },
            "&:hover": {
              borderColor: "#32cd32",
              backgroundColor: "rgba(50, 205, 50, 0.1)",
            },
            "&:disabled": {
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          {t("下一頁")}
        </Button>
      </Box>
    </>
  );
};

export default MemberTable;
