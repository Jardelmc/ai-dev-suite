import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Engineering as TechnicalIcon,
} from '@mui/icons-material';

const DESCRIPTION_TIPS = [
  "Seja específico sobre o domínio do negócio (e-commerce, saúde, educação, etc.)",
  "Mencione os tipos de usuários que irão interagir com o sistema",
  "Descreva os principais fluxos de trabalho ou processos",
  "Inclua integrações com sistemas externos, se houver",
  "Mencione requisitos de performance ou volume de dados esperado",
];

const BUSINESS_RULES_EXAMPLES = [
  "Apenas usuários autenticados podem fazer pedidos",
  "Produtos com estoque zero não devem aparecer na listagem",
  "Descontos só podem ser aplicados por usuários admin",
  "Envio de email de confirmação após cada transação",
  "Backup automático dos dados a cada 24 horas",
];

const TECHNICAL_REQUIREMENTS_EXAMPLES = [
  "API deve responder em menos de 200ms",
  "Sistema deve suportar 1000 usuários simultâneos",
  "Dados devem ser criptografados em trânsito e em repouso",
  "Logs devem ser mantidos por pelo menos 90 dias",
  "Integração com API externa de pagamentos (Stripe/PagSeguro)",
];

const ProjectDescriptionStep = ({ data, onUpdate }) => {
  const handleFieldChange = (field) => (event) => {
    onUpdate({ [field]: event.target.value });
  };

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Descrição do Sistema
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Forneça informações detalhadas sobre o sistema que você deseja desenvolver. 
        Quanto mais específico, melhor será a solução técnica gerada.
      </Typography>

      <Grid container spacing={3}>
        {/* Project Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Nome do Projeto"
            value={data.projectName}
            onChange={handleFieldChange('projectName')}
            placeholder="Ex: Sistema de Gestão de Vendas Online"
            InputProps={{
              startAdornment: <TitleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            helperText="Nome que identifica seu projeto/sistema"
          />
        </Grid>

        {/* Project Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            multiline
            rows={6}
            label="Descrição Geral do Sistema"
            value={data.projectDescription}
            onChange={handleFieldChange('projectDescription')}
            placeholder="Descreva detalhadamente o que o sistema deve fazer, quem são os usuários, principais funcionalidades..."
            InputProps={{
              startAdornment: <DescriptionIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
            }}
            helperText={`${getWordCount(data.projectDescription)} palavras - Seja detalhado e específico`}
          />

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Dicas para uma boa descrição:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {DESCRIPTION_TIPS.map((tip, index) => (
                <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                  {tip}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Business Rules */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Regras de Negócio"
            value={data.businessRules}
            onChange={handleFieldChange('businessRules')}
            placeholder="Liste as principais regras de negócio, validações, processos específicos do domínio..."
            InputProps={{
              startAdornment: <BusinessIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
            }}
            helperText={`${getWordCount(data.businessRules)} palavras - Regras específicas do seu domínio`}
          />

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="subtitle2" gutterBottom>
              Exemplos de regras de negócio:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {BUSINESS_RULES_EXAMPLES.slice(0, 3).map((example, index) => (
                <Chip key={index} label={example} size="small" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Technical Requirements */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Requisitos Técnicos"
            value={data.technicalRequirements}
            onChange={handleFieldChange('technicalRequirements')}
            placeholder="Performance, segurança, integração, escalabilidade, volumes de dados esperados..."
            InputProps={{
              startAdornment: <TechnicalIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />,
            }}
            helperText={`${getWordCount(data.technicalRequirements)} palavras - Requisitos não-funcionais`}
          />

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="subtitle2" gutterBottom>
              Exemplos de requisitos técnicos:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {TECHNICAL_REQUIREMENTS_EXAMPLES.slice(0, 3).map((example, index) => (
                <Chip key={index} label={example} size="small" variant="outlined" />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Validation Alert */}
      {(!data.projectName.trim() || !data.projectDescription.trim()) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Campos obrigatórios:</strong> Nome do projeto e descrição geral são necessários para gerar um prompt de qualidade.
          </Typography>
        </Alert>
      )}

      {(data.projectName.trim() && data.projectDescription.trim()) && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Ótimo!</strong> Você forneceu as informações básicas necessárias. 
            {getWordCount(data.projectDescription + ' ' + data.businessRules + ' ' + data.technicalRequirements)} palavras no total.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ProjectDescriptionStep;