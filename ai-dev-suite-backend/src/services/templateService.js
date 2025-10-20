const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const dbTemplatesService = require('./dbTemplatesService');
const logger = require('../utils/logger');

const getAllTemplates = async () => {
  const db = await dbService.readDb();
  return db.templates || [];
};

const getTemplateById = async (id) => {
  const db = await dbService.readDb();
  const templateMeta = db.templates.find(t => t.id === id);
  if (!templateMeta) {
    return null;
  }

  const templatesDb = await dbTemplatesService.readDb();
  const templateContent = templatesDb.templates.find(tc => tc.id === templateMeta.templateId);

  return {
    ...templateMeta,
    content: templateContent ? templateContent.content : ''
  };
};

const createTemplate = async ({ name, description, type, content }) => {
  const templatesDb = await dbTemplatesService.readDb();
  const templateContentId = uuidv4();
  templatesDb.templates.push({
    id: templateContentId,
    content
  });
  await dbTemplatesService.writeDb(templatesDb);

  const db = await dbService.readDb();
  if (!db.templates) {
    db.templates = [];
  }
  const newTemplate = {
    id: uuidv4(),
    name,
    description: description || '',
    type,
    templateId: templateContentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.templates.push(newTemplate);
  await dbService.writeDb(db);
  logger.info(`Template created: ${name} (id: ${newTemplate.id})`);
  return newTemplate;
};

const updateTemplate = async (id, { name, description, type, content }) => {
  const db = await dbService.readDb();
  const templateIndex = db.templates.findIndex(t => t.id === id);
  if (templateIndex === -1) {
    return null;
  }

  if (content !== undefined) {
    const templateMeta = db.templates[templateIndex];
    const templatesDb = await dbTemplatesService.readDb();
    const contentIndex = templatesDb.templates.findIndex(tc => tc.id === templateMeta.templateId);
    if (contentIndex !== -1) {
      templatesDb.templates[contentIndex].content = content;
    } else {
      templatesDb.templates.push({ id: templateMeta.templateId, content });
    }
    await dbTemplatesService.writeDb(templatesDb);
  }

  const updatedTemplate = {
    ...db.templates[templateIndex],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(type && { type }),
    updatedAt: new Date().toISOString()
  };

  db.templates[templateIndex] = updatedTemplate;
  await dbService.writeDb(db);
  logger.info(`Template updated: ${id}`);
  return updatedTemplate;
};

const deleteTemplate = async (id) => {
  const db = await dbService.readDb();
  const templateIndex = db.templates.findIndex(t => t.id === id);
  if (templateIndex === -1) {
    return false;
  }

  const templateMeta = db.templates[templateIndex];
  db.templates.splice(templateIndex, 1);
  await dbService.writeDb(db);

  const templatesDb = await dbTemplatesService.readDb();
  const contentIndex = templatesDb.templates.findIndex(tc => tc.id === templateMeta.templateId);
  if (contentIndex !== -1) {
    templatesDb.templates.splice(contentIndex, 1);
    await dbTemplatesService.writeDb(templatesDb);
  }

  logger.info(`Template deleted: ${id}`);
  return true;
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};