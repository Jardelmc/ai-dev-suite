const path = require('path');
const fileService = require('./fileService');
const projectService = require('./projectService');
const templateService = require('./templateService');
const codeWriterService = require('./codeWriterService');
const gitignoreService = require('./git/gitignoreService');
const logger = require('../utils/logger');

const createProject = async (rootProject, subProjects) => {
  const { name, description, directory } = rootProject;
  const rootDirExists = await fileService.directoryExists(directory);
  if (!rootDirExists) {
    await fileService.createDirectory(directory);
  }

  const rootProjectData = await projectService.createProject({
    title: name,
    description,
    directory,
    parentId: null,
  });
  const createdSubProjects = [];

  for (const sub of subProjects) {
    const subProjectDir = path.join(directory, sub.name.replace(/\s+/g, '-').toLowerCase());
    const subDirExists = await fileService.directoryExists(subProjectDir);
    if (!subDirExists) {
      await fileService.createDirectory(subProjectDir);
    }

    const subProjectData = await projectService.createProject({
      title: sub.name,
      description: sub.description,
      directory: subProjectDir,
      parentId: rootProjectData.id,
    });
    const gitIgnoreEntry = `${path.relative(rootProjectData.directory, subProjectData.directory).replace(/\\/g, '/')}/.git`;
    await gitignoreService.addEntryToGitignore(rootProjectData.directory, gitIgnoreEntry);

    if (sub.templateId) {
      const template = await templateService.getTemplateById(sub.templateId);
      if (template && template.content) {
        await codeWriterService.generateFiles(subProjectDir, template.content);
        logger.info(`Template '${template.name}' applied to sub-project '${sub.name}'`);
      }
    }
    createdSubProjects.push(subProjectData);
  }

  return { rootProject: rootProjectData, subProjects: createdSubProjects };
};

const generateSolutionPrompt = async (projectId, functionalities) => {
  const rootProject = await projectService.getProjectById(projectId, true);
  if (!rootProject) {
    throw new Error('Project not found');
  }

  let prompt = `## Persona: Arquiteto de Software Sênior Elite (Especialista NodeJS)

Você é um **Arquiteto de Software Sênior Elite** com mais de 15 anos de experiência, especializado em design e implementação de sistemas backend robustos e escaláveis utilizando **NodeJS**.
Sua expertise abrange arquiteturas modernas, padrões de design, JavaScript/TypeScript, infraestrutura, sistemas distribuídos, bancos de dados, segurança e escalabilidade.
Você receberá a estrutura de um projeto já iniciado (analisado e fornecido como contexto) e deve propor uma solução técnica completa para as funcionalidades solicitadas, construindo sobre a arquitetura existente.
## Projeto a ser Desenvolvido

**Nome do Projeto:** ${rootProject.title}
**Descrição:** ${rootProject.description}

### Estrutura do Projeto

O projeto é composto pelos seguintes sub-projetos:
${rootProject.children.map(child => `- **${child.title}**: ${child.description || 'Sub-projeto ' + (child.title.toLowerCase().includes('backend') ? 'backend' : 'frontend')}`).join('\n')}

### Funcionalidades Solicitadas pelo Usuário
\`\`\`
${functionalities}
\`\`\`

## Instruções de Execução

1.  **Análise Profunda:** Analise a estrutura do projeto (que será fornecida em anexo) e as funcionalidades solicitadas.
Entenda como os sub-projetos se comunicarão.
2.  **Solução Técnica Completa:** Elabore uma solução técnica detalhada em formato Markdown.
A solução deve abranger:
    * **Visão Geral:** Um resumo da arquitetura e como as novas funcionalidades se encaixam.
    * **Estrutura de Dados:** Definição ou modificação de schemas/modelos de banco de dados.
    * **API Endpoints:** Detalhamento de todas as rotas de API (método, URL, payload, resposta).
    * **Lógica de Negócio:** Explicação de como os serviços, controllers e repositórios irão interagir para implementar a lógica.
    * **Integração Frontend-Backend:** Se houver um frontend, descreva como os componentes irão consumir a API.
3.  **Plano de Implementação Granular (Tasks):** Esta é a parte mais crítica.
Ao final da solução técnica, crie uma lista de tarefas sequenciais e extremamente detalhadas.
    * **Formato Obrigatório:** Use a notação \`<TASK:ID>[] - Título da Tarefa - Descrição completa...\` para cada tarefa.
    * **Autocontida:** Cada tarefa deve ser uma unidade de trabalho que um desenvolvedor (ou uma IA) possa executar sem precisar tomar decisões de arquitetura.
Especifique quais arquivos modificar, quais funções criar, qual o conteúdo esperado, etc.
    * **Jornada Completa:** Para projetos com frontend, estruture as tarefas como "jornadas" ou "slices verticais".
Cada tarefa (ou pequeno conjunto de tarefas) deve entregar uma pequena parte da funcionalidade de ponta-a-ponta (frontend, backend, banco de dados), permitindo testes e validação contínuos.
    * **Primeira Tarefa:** A primeira task DEVE ser sobre a "Preparação do Projeto".
Ela deve instruir a ajustar os nomes nos arquivos de template (package.json, etc.), remover códigos de exemplo desnecessários e configurar as variáveis de ambiente iniciais para adequar o template ao novo projeto.
## Regras Fundamentais

* **Construa Sobre o Existente:** Sua solução DEVE partir da arquitetura e dos arquivos já presentes nos templates dos sub-projetos.
Não reinvente a roda.
* **Especificidade Máxima:** Seja explícito sobre nomes de arquivos, funções, variáveis, schemas de validação, etc.
* **Sem Ambiguidade:** A resposta não deve conter perguntas ou deixar decisões em aberto.
Agora, com base em todas essas especificações, crie a **Solução Técnica Completa** e o **Plano de Implementação Detalhado** para as funcionalidades solicitadas no projeto "${rootProject.title}".`;
  return prompt;
};


module.exports = {
  createProject,
  generateSolutionPrompt,
};