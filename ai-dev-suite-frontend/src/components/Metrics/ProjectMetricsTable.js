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
  CircularProgress // Import CircularProgress
} from "@mui/material";
import {
  Block as IgnoreIcon,
  // ContentCopy as CopyIcon, // Replaced
  AutoFixHigh as RefactorIcon // Optional: Could use a different icon for the Chip
} from "@mui/icons-material";

// getLineColor function remains the same
const getLineColor = (lines) => {
  if (lines > 600) return "#f44336";
  if (lines > 400) return "#ff9800";
  if (lines > 200) return "#ffc107";
  return "#4caf50";
};

const ProjectMetricsTable = ({
  projectData,
  onIgnoreFile,
  onRefactorAction, // Changed prop name
  actionLoading // Added prop for loading state
}) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("lines");
  const [loadingFile, setLoadingFile] = useState(null); // State to track which file action is loading

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

  const handleRefactorClick = async (filePath) => {
    setLoadingFile(filePath); // Set loading state for this specific file
    await onRefactorAction(filePath);
    setLoadingFile(null); // Reset loading state after action completes
  };

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
                <TableCell sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Tooltip title="Adicionar à lista de ignorados">
                    <span> {/* Span needed for disabled button tooltip */}
                      <IconButton
                        size="small"
                        onClick={() =>
                          onIgnoreFile(file.path, projectData.projectId)
                        }
                        disabled={actionLoading} // Disable during any refactor action
                      >
                        <IgnoreIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {/* Replace IconButton with Chip */}
                   <Tooltip title="Copiar prompt, Analisar/Baixar projeto e Abrir Agente">
                        <span> {/* Span needed for disabled chip tooltip */}
                           <Chip
                                label={loadingFile === file.path ? <CircularProgress size={16} color="inherit" /> : "Refatorar"}
                                size="small"
                                clickable={!actionLoading} // Make it clickable only when not loading
                                onClick={() => !actionLoading && handleRefactorClick(file.path)}
                                disabled={actionLoading} // Disable during any refactor action
                                sx={{
                                    cursor: actionLoading ? 'default' : 'pointer',
                                    backgroundColor: 'success.light',
                                    color: 'success.contrastText',
                                    '&:hover': {
                                      backgroundColor: !actionLoading ? 'success.main' : undefined,
                                    },
                                    height: 24, // Adjust height if needed
                                    fontSize: '0.75rem'
                                }}
                                // icon={loadingFile === file.path ? undefined : <RefactorIcon sx={{ fontSize: 16 }} />} // Optional icon
                           />
                        </span>
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