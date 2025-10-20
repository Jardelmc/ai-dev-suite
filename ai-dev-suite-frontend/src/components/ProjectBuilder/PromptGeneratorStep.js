import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const PromptGeneratorStep = ({ data, onUpdate, showNotification }) => {
  const [copying, setCopying] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generatePrompt();
  }, []);

  const generatePrompt = () => {
    setGenerating(true);
    setTimeout(() => {
      const prompt = buildPrompt(data);
      onUpdate({ generatedPrompt: prompt });
      setGenerating(false);
    }, 1000);
  };

  const buildPrompt = (builderData) => {
    const templates = {
      'api-rest': 'API REST Simples',
      'ecommerce': 'Sistema de E-commerce',
      'crm': 'Sistema CRM',
      'microservices': 'Arquitetura de Microserviços',
      'dashboard': 'Dashboard Analytics',
      'learning': 'Plataforma de Aprendizado'
    };

    const complexityLevels = {
      'level1': 'Nível 1 - POC (Prova de Conceito)',
      'level2': 'Nível 2 - Operacional',
      'level3': 'Nível 3 - Produção'
    };

    const architecturalPatterns = {
      'layered': 'Arquitetura em Camadas',
      'clean': 'Clean Architecture',
      'hexagonal': 'Arquitetura Hexagonal',
      'mvc': 'Model-View-Controller'
    };

    const databases = {
      'mongodb': 'MongoDB com Mongoose',
      'postgresql': 'PostgreSQL com Prisma',
      'mysql': 'MySQL com Prisma',
      'sqlite': 'SQLite com Prisma',
      'redis': 'Redis'
    };

    const authMethods = {
      'jwt': 'JWT (JSON Web Tokens)',
      'oauth': 'OAuth 2.0',
      'passport': 'Passport.js',
      'session': 'Autenticação baseada em sessão',
      'none': 'Sistema sem autenticação'
    };

    // Tecnologias selecionadas
    const selectedTechnologies = [];
    Object.entries(builderData.technologies).forEach(([category, techs]) => {
      if (techs.length > 0) {
        selectedTechnologies.push(...techs);
      }
    });

    let prompt = `## Prompt para Arquiteto de Software Sênior Especialista em NodeJS

## Persona: Arquiteto de Software Sênior Elite (Especialista NodeJS)

Você é um **Arquiteto de Software Sênior Elite** com mais de 15 anos de experiência, especializado em design e implementação de sistemas backend robustos e escaláveis utilizando **NodeJS e Express.js**. Sua expertise abrange arquiteturas modernas, padrões de design, JavaScript (ES6+), infraestrutura, sistemas distribuídos, bancos de dados, segurança e escalabilidade.

## Projeto a ser Desenvolvido

**Nome do Projeto:** ${builderData.projectName}
**Template:** ${templates[builderData.projectTemplate] || builderData.projectTemplate}
**Nível de Complexidade:** ${complexityLevels[builderData.complexityLevel] || builderData.complexityLevel}
**Padrão Arquitetural:** ${architecturalPatterns[builderData.architecturalPattern] || builderData.architecturalPattern}

### Descrição do Sistema
${builderData.projectDescription}

### Especificações Técnicas Obrigatórias

**Tecnologias Principais:**
- **Linguagem:** JavaScript (ES6+ moderno)
- **Framework Backend:** Express.js
- **Banco de Dados:** ${databases[builderData.database] || builderData.database}
- **Autenticação:** ${authMethods[builderData.authentication] || builderData.authentication}
- **Validação:** Joi (obrigatório para todas as entradas de API)

`;

    if (selectedTechnologies.length > 0) {
      prompt += `**Tecnologias Complementares Selecionadas:**
${selectedTechnologies.map(tech => `- ${tech}`).join('\n')}

`;
    }

    if (builderData.features.length > 0) {
      prompt += `**Funcionalidades Obrigatórias:**
${builderData.features.map(feature => `- ${feature}`).join('\n')}

`;
    }

    if (builderData.businessRules.trim()) {
      prompt += `### Regras de Negócio Específicas
${builderData.businessRules}

`;
    }

    if (builderData.technicalRequirements.trim()) {
      prompt += `### Requisitos Técnicos Específicos
${builderData.technicalRequirements}

`;
    }

    prompt += `## Estrutura de Pastas Padrão Obrigatória

\`\`\`
/
|-- infra/
|   |-- docker/
|   |   |-- Dockerfile
|   |   |-- Dockerfile.dev
|   |   \`-- docker-compose.yml
|   |-- database/
|   |   |-- migrations/
|   |   |-- seeders/
|   |   \`-- schema.sql
|   \`-- scripts/
|-- logs/
|-- public/
|-- src/
|   |-- api/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |   \`-- v1/
|   |   \`-- validators/
|   |       \`-- v1/
|   |-- config/
|   |-- core/
|   |   |-- domains/
|   |   |-- dtos/
|   |   |-- enums/
|   |   |-- repositories/
|   |   \`-- services/
|   |-- jobs/
|   |-- utils/
|   |-- app.js
|   \`-- server.js
|-- .env
|-- .env.example
|-- .gitignore
|-- package.json
\`-- README.md
\`\`\`

## Instruções de Execução

1. **Análise Profunda dos Requisitos:**
   - Analise minuciosamente todas as especificações fornecidas
   - Identifique requisitos implícitos baseados no tipo de sistema
   - Considere as tecnologias selecionadas para a arquitetura

2. **Elaboração da Arquitetura:**
   - Projete seguindo o padrão arquitetural especificado: ${architecturalPatterns[builderData.architecturalPattern]}
   - Utilize as tecnologias selecionadas de forma otimizada
   - Garanta aderência à estrutura de pastas obrigatória

3. **Especificação Técnica Detalhada:**
   - Detalhe cada componente (controllers, services, repositories, etc.)
   - Defina todas as interfaces, classes e métodos principais
   - Especifique requisitos de segurança baseados no nível escolhido

`;

    if (builderData.enhanceSystem) {
      prompt += `## 🚀 POTENCIALIZAÇÃO DO SISTEMA ATIVADA

**INSTRUÇÃO ESPECIAL:** Além dos requisitos explicitamente solicitados, você deve analisar o contexto do sistema e **ADICIONAR FUNCIONALIDADES E MELHORIAS** que:
- Façam sentido para o domínio do negócio descrito
- Melhorem significativamente a experiência do usuário
- Aumentem a robustez e profissionalismo do sistema
- Sejam consideradas "state-of-the-art" para este tipo de aplicação
- Antecipem necessidades futuras baseadas em boas práticas

Seja criativo e proativo, mas mantenha coerência com o escopo do projeto.

`;
    }

    prompt += `## Estrutura da Solução Técnica (Saída Obrigatória em Markdown)

Sua solução técnica deve incluir:

### 1. Visão Geral do Sistema
- Descrição concisa do sistema e seus objetivos
- Diagrama conceitual de alto nível (textual)
- Escopo e limitações do projeto

### 2. Requisitos Funcionais e Não-Funcionais
- Lista detalhada baseada nas especificações fornecidas
- Considerações específicas do nível de complexidade escolhido
- Requisitos de performance e escalabilidade

### 3. Arquitetura Proposta
- Justificativa da escolha do banco de dados
- Tecnologias selecionadas com versões específicas
- Diagrama de componentes e fluxos de dados

### 4. Estrutura de Dados
- Definição completa dos schemas/modelos
- DTOs (Data Transfer Objects) necessários
- Relacionamentos entre entidades

### 5. API e Interfaces
- Lista completa dos endpoints da API
- Payloads de requisição e resposta com exemplos
- Schemas de validação Joi para cada endpoint

### 6. Detalhamento da Implementação
- Classes/Módulos principais com métodos e responsabilidades
- Padrões de design aplicados
- Estrutura detalhada seguindo a arquitetura ${architecturalPatterns[builderData.architecturalPattern]}

### 7. Considerações de Segurança
- Implementação da autenticação escolhida: ${authMethods[builderData.authentication]}
- Medidas de segurança apropriadas para o nível ${complexityLevels[builderData.complexityLevel]}
- Validação e sanitização de dados

### 8. Infraestrutura e Implantação
- Configurações Docker e docker-compose
- Estratégias de deployment
- Configuração de ambiente (.env.example)

### 9. Plano de Implementação Detalhado

**ESTA É A SEÇÃO MAIS CRÍTICA** - Crie uma lista sequencial de tarefas extremamente granulares no formato:

\`\`\`
<TASKS>
<TASK:1>[] - Nome da tarefa - Descrição completa: arquivo(s) específico(s), classes/métodos a implementar, propósito da tarefa</TASK:1>
<TASK:2>[] - Nome da tarefa - Descrição completa: arquivo(s) específico(s), classes/métodos a implementar, propósito da tarefa</TASK:2>
...
</TASKS>
\`\`\`

Cada tarefa deve ser autocontida e executável por um desenvolvedor sem decisões adicionais.

## Regras Fundamentais

1. **Aderência Absoluta**: Siga rigorosamente a estrutura de pastas e convenções estabelecidas
2. **Completude**: A solução deve ser 100% completa para o escopo definido
3. **Especificidade**: Nomeie tecnologias, versões e componentes específicos
4. **Decisões Definitivas**: Nunca deixe escolhas para o implementador

Agora, com base em todas essas especificações, crie a **Solução Técnica Completa** para o sistema "${builderData.projectName}".`;

    return prompt;
  };

  const handleCopy = async () => {
    if (!data.generatedPrompt) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(data.generatedPrompt);
      showNotification('Prompt copiado para a área de transferência!', 'success');
    } catch (error) {
      showNotification('Erro ao copiar prompt', 'error');
    } finally {
      setCopying(false);
    }
  };

  const handleDownload = () => {
    if (!data.generatedPrompt) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 16);
    const projectName = data.projectName.replace(/[^a-zA-Z0-9]/g, '_') || 'projeto';
    const fileName = `prompt_${projectName}_${timestamp}.md`;

    const blob = new Blob([data.generatedPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Prompt salvo como arquivo!', 'success');
  };

  const getPromptStats = () => {
    if (!data.generatedPrompt) return { words: 0, chars: 0, lines: 0 };
    
    const words = data.generatedPrompt.trim().split(/\s+/).length;
    const chars = data.generatedPrompt.length;
    const lines = data.generatedPrompt.split('\n').length;
    
    return { words, chars, lines };
  };

  const stats = getPromptStats();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Prompt Gerado
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Seu prompt personalizado foi gerado baseado nas configurações selecionadas. 
        Copie e use com qualquer IA para obter uma solução técnica completa.
      </Typography>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.words.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Palavras
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.chars.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Caracteres
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.lines.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Linhas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Pronto" 
                color="success" 
                sx={{ fontSize: '1rem', p: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={copying ? <CircularProgress size={20} color="inherit" /> : <CopyIcon />}
          onClick={handleCopy}
          disabled={copying || !data.generatedPrompt}
        >
          {copying ? 'Copiando...' : 'Copiar Prompt'}
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={!data.generatedPrompt}
        >
          Baixar como .md
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={generating ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={generatePrompt}
          disabled={generating}
        >
          {generating ? 'Gerando...' : 'Regenerar'}
        </Button>
      </Box>

      {/* Success Alert */}
      {data.generatedPrompt && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Prompt gerado com sucesso!</strong> Este prompt contém todas as especificações 
            técnicas necessárias para que uma IA crie uma solução completa do seu projeto.
          </Typography>
        </Alert>
      )}

      {/* Generated Prompt Display */}
      <Paper sx={{ p: 0 }}>
        <Box sx={{ 
          bgcolor: 'grey.100', 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Prompt Personalizado
          </Typography>
          <IconButton onClick={handleCopy} disabled={copying}>
            <CopyIcon />
          </IconButton>
        </Box>

        {generating ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Gerando prompt personalizado...
            </Typography>
          </Box>
        ) : (
          <TextField
            multiline
            fullWidth
            value={data.generatedPrompt}
            rows={30}
            variant="outlined"
            InputProps={{
              readOnly: true,
              sx: { 
                fontFamily: 'monospace', 
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
              },
            }}
            sx={{ 
              '& .MuiInputBase-root': { 
                borderRadius: 0,
              }
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default PromptGeneratorStep;