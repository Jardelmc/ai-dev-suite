import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Block as IgnoreIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";

const getLineColor = (lines) => {
  if (lines > 600) return "#f44336";
  if (lines > 400) return "#ff9800";
  if (lines > 200) return "#ffc107";
  return "#4caf50";
};

const ProjectMetricsTable = ({
  projectData,
  onIgnoreFile,
  onCopyRefactorPrompt,
}) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("lines");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedFiles = React.useMemo(() => {
    return [...projectData.fileMetrics].sort((a, b) => {
      if (orderBy === "lines" || orderBy === "tokens") {
        return order === "asc"
          ? a[orderBy] - b[orderBy]
          : b[orderBy] - a[orderBy];
      }
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [order, orderBy, projectData.fileMetrics]);
  return (
    <Paper variant="outlined" sx={{ mt: 3 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "grey.100",
        }}
      >
        <Typography variant="h6">{projectData.projectTitle}</Typography>
        <Chip label={`${projectData.totalTokens} Tokens`} color="primary" />
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "path" ? order : false}>
                <TableSortLabel
                  active={orderBy === "path"}
                  direction={orderBy === "path" ? order : "asc"}
                  onClick={() => handleRequestSort("path")}
                >
                  Arquivo
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "lines" ? order : false}>
                <TableSortLabel
                  active={orderBy === "lines"}
                  direction={orderBy === "lines" ? order : "asc"}
                  onClick={() => handleRequestSort("lines")}
                >
                  Linhas
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "tokens" ? order : false}>
                <TableSortLabel
                  active={orderBy === "tokens"}
                  direction={orderBy === "tokens" ? order : "asc"}
                  onClick={() => handleRequestSort("tokens")}
                >
                  Tokens (estimado)
                </TableSortLabel>
              </TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFiles.map((file) => (
              <TableRow key={file.path}>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {file.path}
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.lines}
                    size="small"
                    sx={{
                      backgroundColor: getLineColor(file.lines),
                      color: "white",
                    }}
                  />
                </TableCell>
                <TableCell>{file.tokens}</TableCell>
                <TableCell>
                  <Tooltip title="Adicionar à lista de ignorados">
                    <IconButton
                      size="small"
                      onClick={() =>
                        onIgnoreFile(file.path, projectData.projectId)
                      }
                    >
                      <IgnoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copiar prompt de refatoração">
                    <IconButton
                      size="small"
                      onClick={() => onCopyRefactorPrompt(file.path)}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProjectMetricsTable;
