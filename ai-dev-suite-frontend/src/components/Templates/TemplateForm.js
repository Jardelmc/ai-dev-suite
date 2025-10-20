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
  Box,
  CircularProgress,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import {
  getTemplate,
  createTemplate,
  updateTemplate,
} from "../../services/api";
import TemplatePreview from "./TemplatePreview";

const TemplateForm = ({
  open,
  onClose,
  onSaveSuccess,
  templateToEdit,
  showNotification,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "backend",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchTemplateDetails = async (id) => {
      setLoadingDetails(true);
      try {
        const template = await getTemplate(id);
        setFormData({
          name: template.name || "",
          description: template.description || "",
          type: template.type || "backend",
          content: template.content || "",
        });
      } catch (e) {
        showNotification(
          "Erro ao carregar detalhes do template: " + e.message,
          "error"
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    if (templateToEdit) {
      fetchTemplateDetails(templateToEdit.id);
    } else {
      setFormData({
        name: "",
        description: "",
        type: "backend",
        content: "",
      });
    }
  }, [templateToEdit, open, showNotification]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      showNotification(
        "Nome e Conteúdo do Template são obrigatórios.",
        "warning"
      );
      return;
    }
    setLoading(true);
    try {
      if (templateToEdit) {
        await updateTemplate(templateToEdit.id, formData);
        onSaveSuccess("Template atualizado com sucesso!");
      } else {
        await createTemplate(formData);
        onSaveSuccess("Template criado com sucesso!");
      }
    } catch (e) {
      showNotification("Erro ao salvar template: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {templateToEdit ? "Editar Template" : "Novo Template"}
      </DialogTitle>
      <DialogContent>
        {loadingDetails ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                label="Nome do Template"
                value={formData.name}
                onChange={handleChange("name")}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Descrição"
                value={formData.description}
                onChange={handleChange("description")}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Tipo de Template</FormLabel>
                <RadioGroup
                  row
                  value={formData.type}
                  onChange={handleChange("type")}
                >
                  <FormControlLabel
                    value="backend"
                    control={<Radio />}
                    label="Backend"
                  />
                  <FormControlLabel
                    value="frontend"
                    control={<Radio />}
                    label="Frontend"
                  />
                </RadioGroup>
              </FormControl>
              <TextField
                label="Conteúdo do Template"
                value={formData.content}
                onChange={handleChange("content")}
                fullWidth
                required
                multiline
                rows={15}
                margin="normal"
                placeholder="Cole o conteúdo do template com a notação [FILEPATH:...]...[/FILEPATH]"
                InputProps={{
                  sx: { fontFamily: "monospace", fontSize: "0.875rem" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TemplatePreview templateContent={formData.content} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingDetails}
        >
          {loading ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateForm;
