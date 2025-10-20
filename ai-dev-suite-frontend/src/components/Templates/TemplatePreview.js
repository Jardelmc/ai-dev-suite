import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as FileIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

const TemplatePreview = ({ templateContent }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const fileTree = useMemo(() => {
    const fileRegex = /\[FILEPATH:([^\]]+)\]/g;
    let match;
    const paths = [];
    while ((match = fileRegex.exec(templateContent)) !== null) {
      paths.push(match[1].trim());
    }

    const tree = { name: "Projeto", type: "folder", children: {} };

    paths.forEach((path) => {
      const parts = path.split(/[\\/]/);
      let currentNode = tree;
      parts.forEach((part, index) => {
        if (!part) return;
        if (!currentNode.children[part]) {
          const isFile = index === parts.length - 1;
          currentNode.children[part] = {
            name: part,
            type: isFile ? "file" : "folder",
            path: parts.slice(0, index + 1).join("/"),
            children: isFile ? undefined : {},
          };
        }
        currentNode = currentNode.children[part];
      });
    });
    return tree;
  }, [templateContent]);

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (node, level = 0) => {
    if (!node || !node.children) return null;
    const childrenArray = Object.values(node.children);

    return (
      <List dense disablePadding sx={{ pl: level > 0 ? 2 : 0 }}>
        {childrenArray.map((child) => (
          <React.Fragment key={child.path}>
            <ListItem
              sx={{
                py: 0.5,
                borderLeft: level > 0 ? `1px solid #e0e0e0` : "none",
              }}
              secondaryAction={
                child.type === "folder" && (
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => toggleFolder(child.path)}
                  >
                    {expandedFolders[child.path] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                )
              }
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {child.type === "folder" ? (
                  <FolderIcon fontSize="small" color="primary" />
                ) : (
                  <FileIcon fontSize="small" color="action" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                  >
                    {child.name}
                  </Typography>
                }
              />
            </ListItem>
            {child.type === "folder" && (
              <Collapse
                in={expandedFolders[child.path]}
                timeout="auto"
                unmountOnExit
              >
                {renderTree(child, level + 1)}
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    );
  };

  if (!templateContent.trim() || !templateContent.includes("[FILEPATH:")) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Pré-visualização da Estrutura
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey.50",
          }}
        >
          <Typography color="text.secondary">
            Nenhum arquivo para pré-visualizar. Cole o conteúdo do template ao
            lado.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Pré-visualização da Estrutura
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          maxHeight: 600,
          overflow: "auto",
          backgroundColor: "grey.50",
        }}
      >
        {renderTree(fileTree)}
      </Paper>
    </Box>
  );
};

export default TemplatePreview;
