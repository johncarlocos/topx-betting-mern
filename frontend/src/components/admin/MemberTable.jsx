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
          <Box sx={{ display: "flex", gap: 1 }}>
            
            <Tooltip title={t("編輯")}>
              <IconButton
                aria-label="edit"
                onClick={() => handleEditCredentialOpen(props.row.original)}
              >
                <EditIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("編輯")}>
              <IconButton
                aria-label="edit"
                onClick={() => handleEditPriceOpen(props.row.original)}
              >
                <AttachMoneyIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("刪除")}>
              <IconButton
                aria-label="delete"
                onClick={() => handleDeleteMemberOpen(props.row.original)}
              >
                <DeleteIcon sx={{ fontSize: "1rem" }} />
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
              >
                {props.row.original.blocked
                  ? (
                    <CheckCircleIcon
                      sx={{ fontSize: "1rem", color: "green" }}
                    />
                  )
                  : <BlockIcon sx={{ fontSize: "1rem", color: "red" }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title={props.row.original.immuneToIPBan ? t("撤銷IP封鎖免疫") : t("授予IP封鎖免疫")}>
              <IconButton
                aria-label="toggle-immune"
                onClick={() => handleToggleImmune(props.row.original._id)}
              >
                <VerifiedIcon sx={{ 
                  fontSize: "1rem",
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
      <Box mb={2} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label={t("Search Members")}
          placeholder={t("Type to search...")}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
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
                      whiteSpace: 'nowrap',
                      color: "rgba(255, 255, 255, 0.9)",
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
          {t("第")} {table.getState().pagination.pageIndex + 1} {t("頁")}{" "}
          {t("共")} {table.getPageCount()} {t("頁")}
        </span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("下一頁")}
        </Button>
      </Box>
    </>
  );
};

export default MemberTable;
