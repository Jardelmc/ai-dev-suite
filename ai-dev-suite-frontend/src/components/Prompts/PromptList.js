import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import PromptForm from "./PromptForm";
import { deletePrompt } from "../../services/api";

const PromptList = ({ prompts, categories, loading, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState(null);
  const [filter, setFilter] = useState({ category: "", search: "" });

  const handleMenuOpen = (event, prompt) => {
    setAnchorEl(event.currentTarget);
    setSelectedPrompt(prompt);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPrompt(null);
  };

  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      onAction("Prompt copiado para a área de transferência!", "success");
      handleMenuClose();
    } catch (error) {
      onAction("Erro ao copiar prompt", "error");
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (prompt) => {
    setPromptToDelete(prompt);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePrompt(promptToDelete.id);
      onAction("Prompt excluído com sucesso!", "success");
      setDeleteDialogOpen(false);
      setPromptToDelete(null);
    } catch (error) {
      onAction("Erro ao excluir prompt: " + error.message, "error");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingPrompt(null);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Sem categoria";
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.color : "#9e9e9e";
  };

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory =
      !filter.category || prompt.categoryId === filter.category;
    const matchesSearch =
      !filter.search ||
      prompt.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      prompt.content.toLowerCase().includes(filter.search.toLowerCase()) ||
      (prompt.tags &&
        prompt.tags.some((tag) =>
          tag.toLowerCase().includes(filter.search.toLowerCase())
        ));

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Prompts ({filteredPrompts.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Novo Prompt
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por categoria</InputLabel>
          <Select
            value={filter.category}
            label="Filtrar por categoria"
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <MenuItem value="">Todas as categorias</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Buscar prompts..."
          value={filter.search}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, search: e.target.value }))
          }
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredPrompts.map((prompt) => (
          <Grid item xs={12} sm={6} md={4} key={prompt.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h3" gutterBottom>
                    {prompt.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, prompt)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {prompt.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {prompt.description}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mb: 2,
                  }}
                >
                  {prompt.content}
                </Typography>

                {prompt.categoryId && (
                  <Chip
                    label={getCategoryName(prompt.categoryId)}
                    size="small"
                    sx={{
                      backgroundColor: getCategoryColor(prompt.categoryId),
                      color: "white",
                      mb: 1,
                    }}
                  />
                )}

                {prompt.tags && prompt.tags.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}
                  >
                    {prompt.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPrompts.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {prompts.length === 0
              ? "Nenhum prompt cadastrado"
              : "Nenhum prompt encontrado com os filtros aplicados"}
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleCopy(selectedPrompt)}>
          <CopyIcon sx={{ mr: 1 }} fontSize="small" />
          Copiar
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedPrompt)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteClick(selectedPrompt)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Excluir
        </MenuItem>
      </Menu>

      <PromptForm
        open={formOpen}
        onClose={handleFormClose}
        prompt={editingPrompt}
        categories={categories}
        onSuccess={onAction}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o prompt "{promptToDelete?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromptList;
