import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  Security as AuthIcon,
  Speed as CacheIcon,
  Message as MessagingIcon,
  Description as DocsIcon,
  BugReport as TestingIcon,
  Visibility as MonitoringIcon,
  CloudUpload as DeploymentIcon,
  Extension as IntegrationsIcon,
  Star as FeaturesIcon,
} from '@mui/icons-material';

const DATABASE_OPTIONS = [
  { id: 'mongodb', name: 'MongoDB', description: 'NoSQL document database' },
  { id: 'postgresql', name: 'PostgreSQL', description: 'Advanced relational database' },
  { id: 'mysql', name: 'MySQL', description: 'Popular relational database' },
  { id: 'sqlite', name: 'SQLite', description: 'Lightweight embedded database' },
  { id: 'redis', name: 'Redis', description: 'In-memory data structure store' },
];

const AUTHENTICATION_OPTIONS = [
  { id: 'jwt', name: 'JWT (JSON Web Tokens)', description: 'Stateless token authentication' },
  { id: 'oauth', name: 'OAuth 2.0', description: 'Third-party authentication' },
  { id: 'passport', name: 'Passport.js', description: 'Flexible authentication middleware' },
  { id: 'session', name: 'Session-based', description: 'Traditional session authentication' },
  { id: 'none', name: 'Sem Autenticação', description: 'Sistema público sem autenticação' },
];

const TECHNOLOGY_CATEGORIES = {
  cache: {
    name: 'Cache & Performance',
    icon: CacheIcon,
    options: [
      { id: 'redis-cache', name: 'Redis Cache', description: 'In-memory caching' },
      { id: 'memcached', name: 'Memcached', description: 'Distributed memory caching' },
      { id: 'node-cache', name: 'Node Cache', description: 'Simple in-memory cache' },
      { id: 'compression', name: 'Response Compression', description: 'Gzip compression middleware' },
    ]
  },
  messaging: {
    name: 'Mensageria & Filas',
    icon: MessagingIcon,
    options: [
      { id: 'rabbitmq', name: 'RabbitMQ', description: 'Message broker' },
      { id: 'kafka', name: 'Apache Kafka', description: 'Distributed streaming platform' },
      { id: 'bull', name: 'Bull Queue', description: 'Redis-based job queue' },
      { id: 'agenda', name: 'Agenda.js', description: 'Job scheduling' },
    ]
  },
  documentation: {
    name: 'Documentação',
    icon: DocsIcon,
    options: [
      { id: 'swagger', name: 'Swagger/OpenAPI', description: 'API documentation' },
      { id: 'jsdoc', name: 'JSDoc', description: 'Code documentation' },
      { id: 'postman', name: 'Postman Collection', description: 'API testing collection' },
      { id: 'readme', name: 'Comprehensive README', description: 'Detailed project documentation' },
    ]
  },
  testing: {
    name: 'Testes',
    icon: TestingIcon,
    options: [
      { id: 'jest', name: 'Jest', description: 'Unit and integration testing' },
      { id: 'supertest', name: 'SuperTest', description: 'API endpoint testing' },
      { id: 'mocha', name: 'Mocha + Chai', description: 'Testing framework' },
      { id: 'coverage', name: 'Code Coverage', description: 'Test coverage reports' },
    ]
  },
  monitoring: {
    name: 'Monitoramento & Logs',
    icon: MonitoringIcon,
    options: [
      { id: 'winston', name: 'Winston Logger', description: 'Advanced logging' },
      { id: 'morgan', name: 'Morgan', description: 'HTTP request logger' },
      { id: 'sentry', name: 'Sentry', description: 'Error tracking' },
      { id: 'prometheus', name: 'Prometheus Metrics', description: 'Application metrics' },
    ]
  },
  deployment: {
    name: 'Deploy & Infraestrutura',
    icon: DeploymentIcon,
    options: [
      { id: 'docker', name: 'Docker', description: 'Containerization' },
      { id: 'docker-compose', name: 'Docker Compose', description: 'Multi-container orchestration' },
      { id: 'pm2', name: 'PM2', description: 'Process manager' },
      { id: 'nginx', name: 'Nginx Config', description: 'Reverse proxy configuration' },
    ]
  },
  integrations: {
    name: 'Integrações',
    icon: IntegrationsIcon,
    options: [
      { id: 'email', name: 'Email Service', description: 'Nodemailer integration' },
      { id: 'file-upload', name: 'File Upload', description: 'Multer file handling' },
      { id: 'payment', name: 'Payment Gateway', description: 'Stripe/PayPal integration' },
      { id: 'social-auth', name: 'Social Authentication', description: 'Google/Facebook login' },
    ]
  }
};

const COMMON_FEATURES = [
  { id: 'crud', name: 'CRUD Operations', description: 'Create, Read, Update, Delete functionality' },
  { id: 'pagination', name: 'Pagination', description: 'Data pagination for large datasets' },
  { id: 'filtering', name: 'Advanced Filtering', description: 'Search and filter capabilities' },
  { id: 'sorting', name: 'Sorting', description: 'Data sorting functionality' },
  { id: 'validation', name: 'Data Validation', description: 'Input validation and sanitization' },
  { id: 'rate-limiting', name: 'Rate Limiting', description: 'API request rate limiting' },
  { id: 'cors', name: 'CORS Configuration', description: 'Cross-origin resource sharing' },
  { id: 'health-check', name: 'Health Check', description: 'Application health monitoring endpoint' },
  { id: 'api-versioning', name: 'API Versioning', description: 'Version management for APIs' },
  { id: 'audit-logs', name: 'Audit Logs', description: 'Track user actions and changes' },
];

const TechnologySelectionStep = ({ data, onUpdate }) => {
  const handleDatabaseChange = (event) => {
    onUpdate({ database: event.target.value });
  };

  const handleAuthenticationChange = (event) => {
    onUpdate({ authentication: event.target.value });
  };

  const handleTechnologyToggle = (category, technologyId) => {
    const currentTechs = data.technologies[category] || [];
    const newTechs = currentTechs.includes(technologyId)
      ? currentTechs.filter(id => id !== technologyId)
      : [...currentTechs, technologyId];
    
    onUpdate({
      technologies: {
        ...data.technologies,
        [category]: newTechs
      }
    });
  };

  const handleFeatureToggle = (featureId) => {
    const currentFeatures = data.features || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(id => id !== featureId)
      : [...currentFeatures, featureId];
    
    onUpdate({ features: newFeatures });
  };

  const getTotalSelectedCount = () => {
    const techCount = Object.values(data.technologies).reduce((sum, techs) => sum + techs.length, 0);
    const featureCount = data.features.length;
    return techCount + featureCount + (data.database ? 1 : 0) + (data.authentication ? 1 : 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Seleção de Tecnologias
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Escolha as tecnologias e funcionalidades que seu projeto precisa. 
        Estas seleções irão compor o prompt técnico final.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>{getTotalSelectedCount()} tecnologias/funcionalidades selecionadas</strong> - 
          Quanto mais específico, melhor será o resultado da IA.
        </Typography>
      </Alert>

      {/* Core Technologies */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Tecnologias Principais (Obrigatório)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Banco de Dados</InputLabel>
            <Select
              value={data.database}
              label="Banco de Dados"
              onChange={handleDatabaseChange}
              startAdornment={<DatabaseIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {DATABASE_OPTIONS.map((db) => (
                <MenuItem key={db.id} value={db.id}>
                  <Box>
                    <Typography variant="body2">{db.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {db.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Autenticação</InputLabel>
            <Select
              value={data.authentication}
              label="Autenticação"
              onChange={handleAuthenticationChange}
              startAdornment={<AuthIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {AUTHENTICATION_OPTIONS.map((auth) => (
                <MenuItem key={auth.id} value={auth.id}>
                  <Box>
                    <Typography variant="body2">{auth.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {auth.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Technology Categories */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Tecnologias Complementares
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(TECHNOLOGY_CATEGORIES).map(([categoryKey, category]) => {
          const IconComponent = category.icon;
          const selectedCount = data.technologies[categoryKey]?.length || 0;
          
          return (
            <Grid item xs={12} md={6} key={categoryKey}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconComponent color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h3">
                    {category.name}
                  </Typography>
                  {selectedCount > 0 && (
                    <Chip 
                      label={selectedCount} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 'auto' }} 
                    />
                  )}
                </Box>

                <FormGroup>
                  {category.options.map((option) => (
                    <FormControlLabel
                      key={option.id}
                      control={
                        <Checkbox
                          checked={data.technologies[categoryKey]?.includes(option.id) || false}
                          onChange={() => handleTechnologyToggle(categoryKey, option.id)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Common Features */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        <FeaturesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Funcionalidades Comuns
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {COMMON_FEATURES.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.features?.includes(feature.id) || false}
                    onChange={() => handleFeatureToggle(feature.id)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{feature.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default TechnologySelectionStep;