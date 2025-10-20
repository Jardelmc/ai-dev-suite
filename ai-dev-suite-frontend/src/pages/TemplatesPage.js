import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { getTemplates, deleteTemplate } from "../services/api";
import TemplateList from "../components/Templates/TemplateList";
import TemplateForm from "../components/Templates/TemplateForm";

const TemplatesPage = ({ showNotification }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 for Backend, 1 for Frontend
  const [formOpen, setFormOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const allTemplates = await getTemplates();
      setTemplates(allTemplates);
    } catch (e) {
      const msg = "Erro ao carregar templates: " + e.message;
      setError(msg);
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenForm = (template = null) => {
    setTemplateToEdit(template);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setTemplateToEdit(null);
    setFormOpen(false);
  };

  const handleSaveSuccess = (message) => {
    handleCloseForm();
    showNotification(message, "success");
    loadTemplates();
  };

  const handleDelete = async (templateId) => {
    if (window.confirm("Tem certeza que deseja excluir este template?")) {
      try {
        await deleteTemplate(templateId);
        showNotification("Template excluído com sucesso!", "success");
        loadTemplates();
      } catch (e) {
        showNotification("Erro ao excluir template: " + e.message, "error");
      }
    }
  };

  const filteredTemplates = templates.filter((t) =>
    activeTab === 0 ? t.type === "backend" : t.type === "frontend"
  );

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Templates de Projetos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus templates de backend e frontend para acelerar a
            criação de novos projetos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm(null)}
        >
          Novo Template
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Backend Templates" />
          <Tab label="Frontend Templates" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TemplateList
              templates={filteredTemplates}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
              showNotification={showNotification}
            />
          )}
        </Box>
      </Paper>

      {formOpen && (
        <TemplateForm
          open={formOpen}
          onClose={handleCloseForm}
          onSaveSuccess={handleSaveSuccess}
          templateToEdit={templateToEdit}
          showNotification={showNotification}
        />
      )}
    </Container>
  );
};

export default TemplatesPage;
