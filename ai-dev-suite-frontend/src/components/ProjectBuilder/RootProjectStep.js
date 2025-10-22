import React from "react";
import { Box, Typography, TextField, Grid } from "@mui/material";

const RootProjectStep = ({ data, onUpdate }) => {
  const handleChange = (field) => (event) => {
    onUpdate({ ...data, [field]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Definir Projeto Raiz
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Comece definindo as informações básicas do projeto principal. Todos os
        sub-projetos serão criados dentro do diretório raiz.
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Nome do Projeto Raiz"
            value={data.name}
            onChange={handleChange("name")}
            helperText="Ex: Meu E-commerce, Plataforma de Cursos"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Diretório de Criação"
            value={data.directory}
            onChange={handleChange("directory")}
            helperText="ATENÇÃO: O diretório do Projeto Raiz deve constar neste caminho. Informe o caminho absoluto onde o projeto será criado. Ex: C:\\Users\\SeuUsuario\\Projetos\\MeuProjetoRaiz."
            placeholder="C:\\caminho\\completo\\para\\o\\projeto"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Descrição do Projeto"
            value={data.description}
            onChange={handleChange("description")}
            helperText="Descreva o objetivo geral deste projeto."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RootProjectStep;
