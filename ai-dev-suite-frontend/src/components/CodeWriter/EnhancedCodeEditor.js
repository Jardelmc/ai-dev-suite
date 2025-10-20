import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Create as CreateIcon,
  Restore as RestoreIcon,
  Description as FileIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { generateFiles } from "../../services/api";

const FilePreview = ({ generatedCode, projectTitle }) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const fileTree = useMemo(() => {
    const fileRegex = /\[FILEPATH:([^\]]+)\]/g;
    let match;
    const paths = [];
    while ((match = fileRegex.exec(generatedCode)) !== null) {
      paths.push(match[1].trim());
    }

    const tree = {
      name: projectTitle || "Diretório Raiz",
      type: "folder",
      children: {},
    };

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

    const initialExpanded = {};
    Object.keys(tree.children).forEach((key) => {
      initialExpanded[tree.children[key].path] = true;
    });
    setExpandedFolders(initialExpanded);

    return tree;
  }, [generatedCode, projectTitle]);

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

  if (!generatedCode.trim() || !generatedCode.includes("[FILEPATH:")) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Pré-visualização de Arquivos
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          maxHeight: 400,
          overflow: "auto",
          backgroundColor: "grey.50",
        }}
      >
        {renderTree(fileTree)}
      </Paper>
    </Box>
  );
};

const EnhancedCodeEditor = ({
  onGenerationComplete,
  onError,
  preselectedProject = null,
}) => {
  const [formData, setFormData] = useState({ generatedCode: "" });
  const [loading, setLoading] = useState(false);
  const [useCustomDirectory, setUseCustomDirectory] = useState(false);
  const [customDirectory, setCustomDirectory] = useState("");
  const [lastGeneratedCode, setLastGeneratedCode] = useState("");
  const [showRestoreButton, setShowRestoreButton] = useState(false);

  const handleCodeChange = (event) => {
    setFormData((prev) => ({ ...prev, generatedCode: event.target.value }));
    if (showRestoreButton && event.target.value !== "") {
      setShowRestoreButton(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let dataToSubmit;
    if (useCustomDirectory) {
      if (!customDirectory.trim()) {
        onError(new Error("Informe o diretório personalizado"));
        return;
      }
      dataToSubmit = {
        projectDir: customDirectory.trim(),
        generatedCode: formData.generatedCode,
      };
    } else {
      if (
        !preselectedProject ||
        (!preselectedProject.projectId && !preselectedProject.projectDir)
      ) {
        onError(new Error("Selecione um projeto ou informe um diretório"));
        return;
      }
      dataToSubmit = {
        ...preselectedProject,
        generatedCode: formData.generatedCode,
      };
    }

    if (!formData.generatedCode.trim()) {
      onError(new Error("Informe o código a ser gerado"));
      return;
    }

    if (!formData.generatedCode.includes("[FILEPATH:")) {
      onError(
        new Error(
          "O código deve conter ao menos um bloco [FILEPATH:...][/FILEPATH]"
        )
      );
      return;
    }

    setLoading(true);
    try {
      const result = await generateFiles(dataToSubmit);
      setLastGeneratedCode(formData.generatedCode);
      setFormData((prev) => ({ ...prev, generatedCode: "" }));
      setShowRestoreButton(true);
      onGenerationComplete(result);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = () => {
    setFormData((prev) => ({ ...prev, generatedCode: lastGeneratedCode }));
    setShowRestoreButton(false);
  };

  const getFileCount = () => {
    const matches = formData.generatedCode.match(/\[FILEPATH:/g);
    return matches ? matches.length : 0;
  };

  const hasProjectSelected =
    preselectedProject &&
    (preselectedProject.projectId || preselectedProject.projectDir);

  const projectTitle = preselectedProject?.title || "Projeto";

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Geração de Código
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        {hasProjectSelected
          ? "Cole o código gerado pela IA para criar os arquivos automaticamente."
          : "Selecione um projeto usando o botão flutuante ou informe um diretório manualmente."}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={useCustomDirectory}
              onChange={(e) => setUseCustomDirectory(e.target.checked)}
            />
          }
          label="Usar diretório personalizado (sobrescreve seleção)"
        />

        {useCustomDirectory && (
          <TextField
            fullWidth
            label="Diretório Personalizado"
            value={customDirectory}
            onChange={(e) => setCustomDirectory(e.target.value)}
            placeholder="/caminho/completo/para/o/projeto"
            margin="dense"
            required
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Código Gerado
        </Typography>
        <TextField
          multiline
          fullWidth
          rows={15}
          value={formData.generatedCode}
          onChange={handleCodeChange}
          placeholder="Cole aqui o código gerado pela IA com a notação '['FILEPATH:caminho/arquivo.js]...código...'['/FILEPATH]"
          variant="outlined"
          required
          InputProps={{
            sx: { fontFamily: "monospace", fontSize: "0.875rem" },
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
          }}
        >
          {getFileCount() > 0 && (
            <Chip
              label={`${getFileCount()} arquivo(s) detectado(s)`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      <FilePreview
        generatedCode={formData.generatedCode}
        projectTitle={projectTitle}
      />

      <Box
        sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}
      >
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CreateIcon />
            )
          }
          disabled={
            loading ||
            (!useCustomDirectory && !hasProjectSelected) ||
            (useCustomDirectory && !customDirectory.trim()) ||
            !formData.generatedCode.trim()
          }
          sx={{ minWidth: 180 }}
        >
          {loading ? "Gerando..." : `Gerar ${getFileCount()} Arquivo(s)`}
        </Button>

        {showRestoreButton && (
          <Button
            variant="outlined"
            size="large"
            startIcon={<RestoreIcon />}
            onClick={handleRestore}
            sx={{ minWidth: 140 }}
          >
            Restaurar
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedCodeEditor;
