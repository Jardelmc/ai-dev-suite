import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
} from '@mui/material';
import {
  Api as ApiIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  CloudQueue as MicroservicesIcon,
  Dashboard as DashboardIcon,
  School as LearningIcon,
} from '@mui/icons-material';

const PROJECT_TEMPLATES = [
  {
    id: 'api-rest',
    name: 'API REST Simples',
    description: 'API REST básica com CRUD, autenticação e documentação',
    icon: ApiIcon,
    complexity: 'Baixa',
    estimatedTime: '1-2 semanas',
    features: ['CRUD Operations', 'JWT Auth', 'Swagger Docs', 'Validation']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Backend',
    description: 'Sistema completo de e-commerce com carrinho, pagamentos e inventário',
    icon: StoreIcon,
    complexity: 'Alta',
    estimatedTime: '6-8 semanas',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management', 'Inventory']
  },
  {
    id: 'crm',
    name: 'Sistema CRM',
    description: 'Customer Relationship Management com leads, contatos e campanhas',
    icon: BusinessIcon,
    complexity: 'Média',
    estimatedTime: '4-6 semanas',
    features: ['Lead Management', 'Contact Database', 'Campaign Tracking', 'Reports', 'Email Integration']
  },
  {
    id: 'microservices',
    name: 'Arquitetura de Microserviços',
    description: 'Sistema distribuído com múltiplos serviços especializados',
    icon: MicroservicesIcon,
    complexity: 'Muito Alta',
    estimatedTime: '8-12 semanas',
    features: ['Service Discovery', 'API Gateway', 'Message Queues', 'Circuit Breaker', 'Distributed Tracing']
  },
  {
    id: 'dashboard',
    name: 'Dashboard Analytics',
    description: 'Backend para dashboards com métricas, relatórios e visualizações',
    icon: DashboardIcon,
    complexity: 'Média',
    estimatedTime: '3-5 semanas',
    features: ['Data Aggregation', 'Real-time Metrics', 'Report Generation', 'Data Visualization APIs']
  },
  {
    id: 'learning',
    name: 'Plataforma de Aprendizado',
    description: 'Sistema educacional com cursos, avaliações e progresso',
    icon: LearningIcon,
    complexity: 'Alta',
    estimatedTime: '6-8 semanas',
    features: ['Course Management', 'Student Progress', 'Assessments', 'Certificates', 'Discussion Forums']
  }
];

const COMPLEXITY_LEVELS = [
  {
    id: 'level1',
    name: 'Nível 1 - POC',
    description: 'Prova de conceito rápida para validação'
  },
  {
    id: 'level2',
    name: 'Nível 2 - Operacional',
    description: 'Sistema funcional para ambiente de testes'
  },
  {
    id: 'level3',
    name: 'Nível 3 - Produção',
    description: 'Sistema robusto pronto para produção'
  }
];

const ARCHITECTURAL_PATTERNS = [
  {
    id: 'layered',
    name: 'Arquitetura em Camadas',
    description: 'Separação clara entre apresentação, negócio e dados'
  },
  {
    id: 'clean',
    name: 'Clean Architecture',
    description: 'Independência de frameworks, UI e banco de dados'
  },
  {
    id: 'hexagonal',
    name: 'Arquitetura Hexagonal',
    description: 'Ports & Adapters para alta testabilidade'
  },
  {
    id: 'mvc',
    name: 'Model-View-Controller',
    description: 'Padrão clássico MVC adaptado para APIs'
  }
];

const ProjectTemplateStep = ({ data, onUpdate }) => {
  const handleTemplateSelect = (templateId) => {
    onUpdate({ projectTemplate: templateId });
  };

  const handleComplexityChange = (event) => {
    onUpdate({ complexityLevel: event.target.value });
  };

  const handleArchitecturalPatternChange = (event) => {
    onUpdate({ architecturalPattern: event.target.value });
  };

  const handleEnhanceSystemChange = (event) => {
    onUpdate({ enhanceSystem: event.target.checked });
  };

  const selectedTemplate = PROJECT_TEMPLATES.find(t => t.id === data.projectTemplate);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configuração do Projeto
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Escolha o template que melhor se adequa ao seu projeto e configure os parâmetros básicos.
      </Typography>

      {/* Template Selection */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
        1. Selecione o Template do Projeto
      </Typography>

      <Grid container spacing={2}>
        {PROJECT_TEMPLATES.map((template) => {
          const IconComponent = template.icon;
          return (
            <Grid item xs={12} md={6} key={template.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: data.projectTemplate === template.id ? 2 : 1,
                  borderColor: data.projectTemplate === template.id ? 'primary.main' : 'divider',
                  bgcolor: data.projectTemplate === template.id ? 'action.selected' : 'background.paper'
                }}
              >
                <CardActionArea 
                  onClick={() => handleTemplateSelect(template.id)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <IconComponent color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="h3">
                        {template.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {template.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={`Complexidade: ${template.complexity}`} 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                      <Chip 
                        label={template.estimatedTime} 
                        size="small" 
                        variant="outlined"
                        sx={{ mb: 1 }} 
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Funcionalidades: {template.features.join(', ')}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {selectedTemplate && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Template Selecionado:</strong> {selectedTemplate.name} - {selectedTemplate.description}
          </Typography>
        </Alert>
      )}

      {/* Configuration Options */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        2. Configurações Técnicas
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Nível de Complexidade</InputLabel>
            <Select
              value={data.complexityLevel}
              label="Nível de Complexidade"
              onChange={handleComplexityChange}
            >
              {COMPLEXITY_LEVELS.map((level) => (
                <MenuItem key={level.id} value={level.id}>
                  {level.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {COMPLEXITY_LEVELS.find(l => l.id === data.complexityLevel)?.description}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Padrão Arquitetural</InputLabel>
            <Select
              value={data.architecturalPattern}
              label="Padrão Arquitetural"
              onChange={handleArchitecturalPatternChange}
            >
              {ARCHITECTURAL_PATTERNS.map((pattern) => (
                <MenuItem key={pattern.id} value={pattern.id}>
                  {pattern.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {ARCHITECTURAL_PATTERNS.find(p => p.id === data.architecturalPattern)?.description}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.enhanceSystem}
                  onChange={handleEnhanceSystemChange}
                  color="primary"
                />
              }
              label="Potencializar Sistema"
            />
            <Typography variant="caption" color="text.secondary">
              A IA adicionará funcionalidades extras que fazem sentido para o contexto
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectTemplateStep;