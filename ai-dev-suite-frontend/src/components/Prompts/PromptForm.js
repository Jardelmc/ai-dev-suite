import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { createPrompt, updatePrompt } from "../../services/api";

const PromptForm = ({ open, onClose, prompt, categories, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    categoryId: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title || "",
        content: prompt.content || "",
        description: prompt.description || "",
        categoryId: prompt.categoryId || "",
        tags: prompt.tags || [],
      });
    } else {
      setFormData({
        title: "",
        content: "",
        description: "",
        categoryId: "",
        tags: [],
      });
    }
  }, [prompt, open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleTagInputKeyPress = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        categoryId: formData.categoryId || null,
      };

      if (prompt) {
        await updatePrompt(prompt.id, data);
        onSuccess("Prompt atualizado com sucesso!");
      } else {
        await createPrompt(data);
        onSuccess("Prompt criado com sucesso!");
      }

      onClose();
    } catch (error) {
      onSuccess("Erro ao salvar prompt: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{prompt ? "Editar Prompt" : "Novo Prompt"}</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Título"
          fullWidth
          variant="outlined"
          value={formData.title}
          onChange={handleChange("title")}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          label="Descrição"
          fullWidth
          variant="outlined"
          value={formData.description}
          onChange={handleChange("description")}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={formData.categoryId}
            label="Categoria"
            onChange={handleChange("categoryId")}
          >
            <MenuItem value="">Sem categoria</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Adicionar Tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            onBlur={addTag}
            placeholder="Digite uma tag e pressione Enter"
            size="small"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => removeTag(tag)}
                size="small"
              />
            ))}
          </Box>
        </Box>

        <TextField
          margin="dense"
          label="Conteúdo"
          fullWidth
          variant="outlined"
          value={formData.content}
          onChange={handleChange("content")}
          required
          multiline
          rows={10}
          placeholder="Digite o conteúdo do prompt aqui..."
          InputProps={{
            sx: { fontFamily: "monospace", fontSize: "0.875rem" },
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading || !formData.title.trim() || !formData.content.trim()
          }
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Salvando..." : prompt ? "Atualizar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptForm;
