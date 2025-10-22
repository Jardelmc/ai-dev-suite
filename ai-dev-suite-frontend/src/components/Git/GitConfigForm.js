import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Paper,
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccountCircle,
  Email,
  Code,
  Edit,
} from "@mui/icons-material";
import {
  setGitUserConfig,
  setGitEditorConfig,
  addGitAlias,
  removeGitAlias,
} from "../../services/api";

const GitConfigForm = ({
  initialConfig,
  onActionSuccess,
  showNotification,
}) => {
  const [name, setName] = useState(initialConfig.name || "");
  const [email, setEmail] = useState(initialConfig.email || "");
  const [editor, setEditor] = useState(initialConfig.editor || "");
  const [aliases, setAliases] = useState(initialConfig.aliases || {});
  const [newAliasName, setNewAliasName] = useState("");
  const [newAliasCommand, setNewAliasCommand] = useState("");
  const [loading, setLoading] = useState({
    user: false,
    editor: false,
    alias: false,
  });

  const handleSaveUser = async () => {
    setLoading((prev) => ({ ...prev, user: true }));
    try {
      await setGitUserConfig({ name, email });
      onActionSuccess("Nome e e-mail do Git atualizados com sucesso!");
    } catch (error) {
      showNotification(
        `Erro ao atualizar nome/e-mail: ${error.message}`,
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  };

  const handleSaveEditor = async () => {
    setLoading((prev) => ({ ...prev, editor: true }));
    try {
      await setGitEditorConfig({ editor });
      onActionSuccess("Editor padrão do Git atualizado com sucesso!");
    } catch (error) {
      showNotification(`Erro ao atualizar editor: ${error.message}`, "error");
    } finally {
      setLoading((prev) => ({ ...prev, editor: false }));
    }
  };

  const handleAddAlias = async () => {
    if (!newAliasName.trim() || !newAliasCommand.trim()) {
      showNotification("Nome e comando do alias são obrigatórios.", "warning");
      return;
    }
    setLoading((prev) => ({ ...prev, alias: true }));
    try {
      await addGitAlias({
        alias: newAliasName.trim(),
        command: newAliasCommand.trim(),
      });
      setNewAliasName("");
      setNewAliasCommand("");
      onActionSuccess(`Alias '${newAliasName.trim()}' adicionado com sucesso!`); // This will trigger a reload via parent
    } catch (error) {
      showNotification(`Erro ao adicionar alias: ${error.message}`, "error");
    } finally {
      setLoading((prev) => ({ ...prev, alias: false }));
    }
  };

  const handleRemoveAlias = async (aliasName) => {
    setLoading((prev) => ({ ...prev, alias: true }));
    try {
      await removeGitAlias(aliasName);
      onActionSuccess(`Alias '${aliasName}' removido com sucesso!`); // This will trigger a reload via parent
    } catch (error) {
      showNotification(`Erro ao remover alias: ${error.message}`, "error");
    } finally {
      setLoading((prev) => ({ ...prev, alias: false }));
    }
  };

  return (
    <Box>
      {/* User Config */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <AccountCircle sx={{ mr: 1 }} /> Informações do Usuário
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome de Usuário"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <AccountCircle sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            size="small"
            InputProps={{
              startAdornment: <Email sx={{ color: "action.active", mr: 1 }} />,
            }}
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        onClick={handleSaveUser}
        disabled={loading.user || !name || !email}
        startIcon={
          loading.user ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SaveIcon />
          )
        }
        sx={{ mb: 4 }}
      >
        Salvar Usuário
      </Button>

      <Divider sx={{ my: 4 }} />

      {/* Editor Config */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Edit sx={{ mr: 1 }} /> Editor Padrão
      </Typography>
      <TextField
        fullWidth
        label="Comando do Editor"
        value={editor}
        onChange={(e) => setEditor(e.target.value)}
        placeholder="Ex: code --wait, nano, vim"
        size="small"
        helperText="Comando executado pelo Git para abrir o editor (ex: para mensagens de commit)."
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <Code sx={{ color: "action.active", mr: 1 }} />,
        }}
      />
      <Button
        variant="contained"
        onClick={handleSaveEditor}
        disabled={loading.editor || !editor}
        startIcon={
          loading.editor ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SaveIcon />
          )
        }
        sx={{ mb: 4 }}
      >
        Salvar Editor
      </Button>

      <Divider sx={{ my: 4 }} />

      {/* Aliases */}
      <Typography variant="h6" gutterBottom>
        Aliases Globais
      </Typography>
      <Paper
        variant="outlined"
        sx={{ maxHeight: 250, overflow: "auto", mb: 2 }}
      >
        <List dense>
          {Object.entries(aliases).length > 0 ? (
            Object.entries(aliases).map(([aliasName, aliasCommand]) => (
              <ListItem
                key={aliasName}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveAlias(aliasName)}
                    disabled={loading.alias}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontWeight: "bold" }}
                    >{`git ${aliasName}`}</Typography>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {aliasCommand}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText secondary="Nenhum alias global configurado." />
            </ListItem>
          )}
        </List>
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Adicionar Novo Alias
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Nome do Alias"
            value={newAliasName}
            onChange={(e) => setNewAliasName(e.target.value)}
            placeholder="Ex: st, co, lg"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Comando Git"
            value={newAliasCommand}
            onChange={(e) => setNewAliasCommand(e.target.value)}
            placeholder="Ex: status, checkout, log --oneline --graph"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAddAlias}
            disabled={
              loading.alias || !newAliasName.trim() || !newAliasCommand.trim()
            }
            startIcon={
              loading.alias ? <CircularProgress size={20} /> : <AddIcon />
            }
          >
            Adicionar
          </Button>
        </Grid>
      </Grid>
      {!initialConfig.name || !initialConfig.email ? (
        <Alert severity="warning" sx={{ mt: 4 }}>
          Parece que seu nome e/ou e-mail não estão configurados globalmente no
          Git. É altamente recomendável configurá-los.
        </Alert>
      ) : null}
    </Box>
  );
};

export default GitConfigForm;
