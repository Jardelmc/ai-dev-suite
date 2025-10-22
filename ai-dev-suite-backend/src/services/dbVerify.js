const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/logger");

// --- Main DB Config ---
const DB_PATH = path.join(process.cwd(), "db.json");
const REQUIRED_ARRAYS = [
  "categories",
  "prompts",
  "projects",
  "ignores",
  "templates",
  "gitSettings",
];

// --- Templates DB Config ---
const DB_TEMPLATES_PATH = path.join(process.cwd(), "db_templates.json");
const REQUIRED_TEMPLATES_KEY = "templates";

// --- Main DB Functions ---
const createEmptyDb = async () => {
  logger.info("Creating new db.json with required arrays...");
  const initialData = {};
  REQUIRED_ARRAYS.forEach((key) => {
    initialData[key] = [];
  });
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
    logger.info("Successfully created db.json.");
  } catch (writeError) {
    logger.error(`Failed to write new db.json: ${writeError.message}`);
    throw writeError;
  }
};

const initializeMainDatabase = async () => {
  let db;
  let data;

  try {
    data = await fs.readFile(DB_PATH, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      logger.warn("db.json not found.");
      await createEmptyDb();
      return;
    }
    logger.error(`Failed to read db.json: ${error.message}`);
    throw error;
  }

  try {
    db = JSON.parse(data);
  } catch (parseError) {
    logger.error(
      `Failed to parse db.json (corrupt file): ${parseError.message}`
    );
    const backupPath = `${DB_PATH}.corrupt.${Date.now()}`;
    try {
      await fs.rename(DB_PATH, backupPath);
      logger.info(`Corrupt db.json backed up to ${backupPath}`);
    } catch (backupError) {
      logger.error(`Failed to backup corrupt db.json: ${backupError.message}`);
    }
    await createEmptyDb();
    return;
  }

  let needsWrite = false;
  if (typeof db !== "object" || db === null) {
    logger.warn("db.json root is not an object. Recreating file.");
    await createEmptyDb();
    return;
  }

  REQUIRED_ARRAYS.forEach((key) => {
    if (!Array.isArray(db[key])) {
      logger.warn(`Missing or invalid array "${key}" in db.json. Creating...`);
      db[key] = [];
      needsWrite = true;
    }
  });

  if (needsWrite) {
    logger.info("Updating db.json with missing arrays...");
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
      logger.info("db.json successfully repaired.");
    } catch (writeError) {
      logger.error(`Failed to write repaired db.json: ${writeError.message}`);
      throw writeError;
    }
  } else {
    logger.info("db.json verified and is healthy.");
  }
};

// --- Templates DB Functions ---
const createEmptyTemplatesDb = async () => {
  logger.info("Creating new db_templates.json...");
  const initialData = { [REQUIRED_TEMPLATES_KEY]: [] };
  try {
    await fs.writeFile(
      DB_TEMPLATES_PATH,
      JSON.stringify(initialData, null, 2),
      "utf8"
    );
    logger.info("Successfully created db_templates.json.");
  } catch (writeError) {
    logger.error(
      `Failed to write new db_templates.json: ${writeError.message}`
    );
    throw writeError;
  }
};

const initializeTemplatesDatabase = async () => {
  let db;
  let data;

  try {
    data = await fs.readFile(DB_TEMPLATES_PATH, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      logger.warn("db_templates.json not found.");
      await createEmptyTemplatesDb();
      return;
    }
    logger.error(`Failed to read db_templates.json: ${error.message}`);
    throw error;
  }

  try {
    db = JSON.parse(data);
  } catch (parseError) {
    logger.error(
      `Failed to parse db_templates.json (corrupt file): ${parseError.message}`
    );
    const backupPath = `${DB_TEMPLATES_PATH}.corrupt.${Date.now()}`;
    try {
      await fs.rename(DB_TEMPLATES_PATH, backupPath);
      logger.info(`Corrupt db_templates.json backed up to ${backupPath}`);
    } catch (backupError) {
      logger.error(
        `Failed to backup corrupt db_templates.json: ${backupError.message}`
      );
    }
    await createEmptyTemplatesDb();
    return;
  }

  let needsWrite = false;
  if (typeof db !== "object" || db === null) {
    logger.warn("db_templates.json root is not an object. Recreating file.");
    await createEmptyTemplatesDb();
    return;
  }

  if (!Array.isArray(db[REQUIRED_TEMPLATES_KEY])) {
    logger.warn(
      `Missing or invalid array "${REQUIRED_TEMPLATES_KEY}" in db_templates.json. Creating...`
    );
    db[REQUIRED_TEMPLATES_KEY] = [];
    needsWrite = true;
  }

  if (needsWrite) {
    logger.info("Updating db_templates.json with missing array...");
    try {
      await fs.writeFile(
        DB_TEMPLATES_PATH,
        JSON.stringify(db, null, 2),
        "utf8"
      );
      logger.info("db_templates.json successfully repaired.");
    } catch (writeError) {
      logger.error(
        `Failed to write repaired db_templates.json: ${writeError.message}`
      );
      throw writeError;
    }
  } else {
    logger.info("db_templates.json verified and is healthy.");
  }
};

// --- Combined Initializer ---
const initializeDatabase = async () => {
  await initializeMainDatabase();
  await initializeTemplatesDatabase();
};

module.exports = {
  initializeDatabase,
};
