const { v4: uuidv4 } = require("uuid");
const dbService = require("./dbService");
const logger = require("../utils/logger");

const getAllPrompts = async () => {
  const db = await dbService.readDb();
  return db.prompts || [];
};

const getPromptsByCategory = async (categoryId) => {
  const db = await dbService.readDb();
  return db.prompts.filter((prompt) => prompt.categoryId === categoryId) || [];
};

const getPromptById = async (id) => {
  const db = await dbService.readDb();
  return db.prompts.find((prompt) => prompt.id === id) || null;
};

const createPrompt = async ({
  title,
  content,
  categoryId,
  tags,
  description,
}) => {
  const db = await dbService.readDb();
  if (categoryId) {
    const categoryExists = db.categories.find((cat) => cat.id === categoryId);
    if (!categoryExists) {
      throw new Error("Category not found.");
    }
  }

  const newPrompt = {
    id: uuidv4(),
    title,
    content,
    categoryId: categoryId || null,
    tags: tags || [],
    description: description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!db.prompts) db.prompts = [];
  db.prompts.push(newPrompt);
  await dbService.writeDb(db);
  logger.info(`Prompt created: ${title} (id: ${newPrompt.id})`);
  return newPrompt;
};

const updatePrompt = async (
  id,
  { title, content, categoryId, tags, description }
) => {
  const db = await dbService.readDb();
  const promptIndex = db.prompts.findIndex((prompt) => prompt.id === id);

  if (promptIndex === -1) {
    return null;
  }

  if (categoryId) {
    const categoryExists = db.categories.find((cat) => cat.id === categoryId);
    if (!categoryExists) {
      throw new Error("Category not found.");
    }
  }

  const updatedPrompt = {
    ...db.prompts[promptIndex],
    ...(title && { title }),
    ...(content !== undefined && { content }),
    ...(categoryId !== undefined && { categoryId }),
    ...(tags !== undefined && { tags }),
    ...(description !== undefined && { description }),
    updatedAt: new Date().toISOString(),
  };
  db.prompts[promptIndex] = updatedPrompt;
  await dbService.writeDb(db);
  logger.info(`Prompt updated: ${id}`);
  return updatedPrompt;
};

const deletePrompt = async (id) => {
  const db = await dbService.readDb();
  const promptIndex = db.prompts.findIndex((prompt) => prompt.id === id);

  if (promptIndex === -1) {
    return false;
  }

  db.prompts.splice(promptIndex, 1);
  await dbService.writeDb(db);
  logger.info(`Prompt deleted: ${id}`);
  return true;
};

const exportPrompts = async () => {
  const db = await dbService.readDb();
  const promptsToExport = db.prompts || [];
  const categoriesToExport = db.categories || [];

  const exportData = {
    prompts: promptsToExport,
    categories: categoriesToExport,
    exportedAt: new Date().toISOString(),
  };

  logger.info(
    `Exporting ${promptsToExport.length} prompts, ${categoriesToExport.length} categories.`
  );
  return exportData;
};

const exportPromptById = async (id) => {
  const db = await dbService.readDb();
  const prompt = db.prompts.find((p) => p.id === id);

  if (!prompt) {
    throw new Error("Prompt not found.");
  }

  let category = null;
  if (prompt.categoryId) {
    category = db.categories.find((c) => c.id === prompt.categoryId);
  }

  const exportData = {
    prompts: [prompt],
    categories: category ? [category] : [],
    exportedAt: new Date().toISOString(),
  };

  logger.info(`Exporting single prompt: ${prompt.title} (id: ${id})`);
  return exportData;
};

const importPrompts = async (importData) => {
  const db = await dbService.readDb();
  const importedPrompts = importData.prompts || [];
  const importedCategories = importData.categories || [];

  let categoriesAdded = 0;
  let promptsAdded = 0;
  let promptsUpdated = 0;

  if (!db.categories) db.categories = [];
  if (!db.prompts) db.prompts = [];

  // Import/Update Categories
  for (const importedCategory of importedCategories) {
    const existingIndex = db.categories.findIndex(
      (c) => c.id === importedCategory.id
    );
    if (existingIndex === -1) {
      // Add new category
      db.categories.push({ ...importedCategory });
      categoriesAdded++;
    }
  }

  // Import/Update Prompts
  for (const importedPrompt of importedPrompts) {
    // Validate category exists
    if (
      importedPrompt.categoryId &&
      !db.categories.some((c) => c.id === importedPrompt.categoryId)
    ) {
      logger.warn(
        `Prompt ${importedPrompt.id} skipped: Category ${importedPrompt.categoryId} not found after import.`
      );
      continue; // Skip prompt if its category wasn't imported or doesn't exist
    }

    const existingIndex = db.prompts.findIndex(
      (p) => p.id === importedPrompt.id
    );
    if (existingIndex === -1) {
      // Add new prompt
      db.prompts.push({ ...importedPrompt });
      promptsAdded++;
    } else {
      // Update existing prompt (overwrite)
      db.prompts[existingIndex] = { ...importedPrompt };
      promptsUpdated++;
    }
  }

  await dbService.writeDb(db);
  const summary = `Import complete: ${categoriesAdded} categories added, ${promptsAdded} prompts added, ${promptsUpdated} prompts updated.`;
  logger.info(summary);

  return {
    categoriesAdded,
    promptsAdded,
    promptsUpdated,
    message: summary,
  };
};

module.exports = {
  getAllPrompts,
  getPromptsByCategory,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  exportPrompts,
  exportPromptById, // Export new function
  importPrompts,
};
