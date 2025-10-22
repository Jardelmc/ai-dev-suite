import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container, Typography, Paper, Box, Tabs, Tab, Button, CircularProgress } from "@mui/material";
import { UploadFile as ImportIcon, Download as ExportIcon } from "@mui/icons-material";
import PromptList from "../components/Prompts/PromptList";
import CategoryManager from "../components/Prompts/CategoryManager";
import { getPrompts, getCategories, exportPrompts, importPrompts } from "../services/api";

const PromptsPage = ({ showNotification }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [promptsData, categoriesData] = await Promise.all([
        getPrompts(),
        getCategories(),
      ]);
      setPrompts(promptsData);
      setCategories(categoriesData);
    } catch (error) {
      showNotification("Erro ao carregar dados: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePromptAction = (message, severity = "success") => {
    showNotification(message, severity);
    loadData();
  };

  const handleCategoryAction = (message, severity = "success") => {
    showNotification(message, severity);
    loadData();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportPrompts();
      showNotification(`Arquivo ${result.filename} exportado com sucesso!`, 'success');
    } catch (error) {
      showNotification("Erro ao exportar prompts: " + error.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showNotification('Por favor, selecione um arquivo .json válido.', 'warning');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importPrompts(file);
      showNotification(result.message || 'Importação concluída!', 'success');
      loadData(); // Reload data after import
    } catch (error) {
      showNotification("Erro ao importar prompts: " + error.message, "error");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Prompt Library
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Gerencie sua biblioteca de prompts e organize por categorias. Importe e exporte sua coleção.
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={isImporting ? <CircularProgress size={20}/> : <ImportIcon />}
              onClick={handleImportClick}
              disabled={isImporting || isExporting}
            >
              Importar
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={isExporting ? <CircularProgress size={20}/> : <ExportIcon />}
              onClick={handleExport}
              disabled={isExporting || isImporting || prompts.length === 0}
            >
              Exportar Todos
            </Button>
        </Box>
      </Box>


      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Prompts" />
          <Tab label="Categorias" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <PromptList
              prompts={prompts}
              categories={categories}
              loading={loading}
              onAction={handlePromptAction}
            />
          ) : (
            <CategoryManager
              categories={categories}
              loading={loading}
              onAction={handleCategoryAction}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PromptsPage;