import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  CircularProgress,
  Typography,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import { getPrompts, getCategories } from "../../services/api";

const STORAGE_KEY_FILTERS = "aiDevSuiteGoDevPromptFilters";

const PromptSelectorModal = ({
  open,
  onClose,
  onSelect,
  showNotification,
  initialSelection,
}) => {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [filters, setFilters] = useState({ category: "", search: "" });

  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY_FILTERS);
      if (savedFilters) {
        setFilters(JSON.parse(savedFilters));
      }
    } catch (error) {
      console.warn("Could not read prompt filters from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedPrompts(initialSelection || []);
    }
  }, [open, initialSelection]);

  const loadData = useCallback(async () => {
    if (open) {
      setLoading(true);
      try {
        const [promptsData, categoriesData] = await Promise.all([
          getPrompts(filters.category),
          getCategories(),
        ]);
        setPrompts(promptsData);
        setCategories(categoriesData);
      } catch (error) {
        showNotification("Erro ao carregar prompts: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    }
  }, [open, filters.category, showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (field) => (event) => {
    const newFilters = { ...filters, [field]: event.target.value };
    setFilters(newFilters);
    try {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(newFilters));
    } catch (error) {
      console.warn("Could not save prompt filters to localStorage", error);
    }
  };

  const handleTogglePrompt = (prompt) => {
    setSelectedPrompts((prev) => {
      const isSelected = prev.some((p) => p.id === prompt.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== prompt.id);
      } else {
        return [...prev, prompt];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(selectedPrompts);
    onClose();
  };

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.content.toLowerCase().includes(filters.search.toLowerCase())
  );

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Sem categoria";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Selecionar Prompts da Biblioteca</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={filters.category}
              label="Categoria"
              onChange={handleFilterChange("category")}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Buscar"
            value={filters.search}
            onChange={handleFilterChange("search")}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        {loading ? (
          <CircularProgress />
        ) : (
          <Paper variant="outlined" sx={{ height: 400, overflow: "auto" }}>
            <List>
              {filteredPrompts.map((prompt) => {
                const isSelected = selectedPrompts.some(
                  (p) => p.id === prompt.id
                );
                return (
                  <ListItemButton
                    key={prompt.id}
                    onClick={() => handleTogglePrompt(prompt)}
                  >
                    <Checkbox
                      checked={isSelected}
                      edge="start"
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={prompt.title}
                      secondary={
                        <Box component="span">
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{ display: "block" }}
                          >
                            {prompt.content.substring(0, 100)}...
                          </Typography>
                          <Chip
                            label={getCategoryName(prompt.categoryId)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2">
          Selecionados ({selectedPrompts.length}):
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {selectedPrompts.map((p) => (
            <Chip
              key={p.id}
              label={p.title}
              onDelete={() => handleTogglePrompt(p)}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirmar Seleção
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptSelectorModal;
