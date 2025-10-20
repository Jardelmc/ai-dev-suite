import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Box, Tabs, Tab } from "@mui/material";
import PromptList from "../components/Prompts/PromptList";
import CategoryManager from "../components/Prompts/CategoryManager";
import { getPrompts, getCategories } from "../services/api";

const PromptsPage = ({ showNotification }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Prompt Library
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie sua biblioteca de prompts e organize por categorias.
        </Typography>
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
