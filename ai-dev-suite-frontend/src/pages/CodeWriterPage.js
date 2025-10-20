import React, { useState } from "react";
import { Container, Typography, Paper, Box, Alert } from "@mui/material";
import { useProjectContext } from "../contexts/ProjectContext";
import EnhancedCodeEditor from "../components/CodeWriter/EnhancedCodeEditor";

const CodeWriterPage = ({ showNotification }) => {
  const { selectedProject, getProjectSelection } = useProjectContext();
  const [result, setResult] = useState(null);

  const handleGenerationComplete = (generationResult) => {
    const resultData = generationResult.data || {};
    setResult(resultData);

    if (resultData.errors && resultData.errors.length > 0) {
      showNotification(
        `Geração parcial: ${resultData.filesWritten} arquivos criados com ${resultData.errors.length} erros`,
        "warning"
      );
    } else {
      showNotification(
        `${resultData.filesWritten} arquivos gerados com sucesso!`,
        "success"
      );
    }
  };

  const handleError = (error) => {
    showNotification(error.message || "Erro na geração de código", "error");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Code Writer
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gere arquivos automaticamente a partir de código fornecido usando a
          notação [FILEPATH:...][/FILEPATH]. Organize seus projetos e acelere o
          desenvolvimento.
        </Typography>
      </Box>

      {!selectedProject && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Nenhum projeto selecionado.</strong> Selecione um projeto no
            seletor global acima ou use o formulário abaixo para informar um
            diretório específico.
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <EnhancedCodeEditor
          onGenerationComplete={handleGenerationComplete}
          onError={handleError}
          preselectedProject={selectedProject ? getProjectSelection() : null}
        />
      </Paper>

      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultado da Geração
          </Typography>

          <Alert
            severity={result.errors?.length > 0 ? "warning" : "success"}
            sx={{ mb: 2 }}
          >
            {result.errors?.length > 0
              ? `${result.filesWritten}/${result.totalFiles} arquivos gerados com sucesso`
              : `${result.filesWritten} arquivos gerados com sucesso`}
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Diretório:</strong> <code>{result.directory}</code>
          </Typography>

          {result.errors && result.errors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Erros encontrados:
              </Typography>
              {result.errors.map((error, index) => (
                <Alert key={index} severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default CodeWriterPage;
