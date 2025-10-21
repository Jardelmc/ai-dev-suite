const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/logger");
const DB_PATH = path.join(process.cwd(), "db.json");

const readDb = async () => {
  try {
    const data = await fs.readFile(DB_PATH, "utf8");
    const db = JSON.parse(data);
    return db;
  } catch (error) {
    if (error.code === "ENOENT") {
      logger.warn("db.json not found, creating a new one.");
      const initialData = {
        categories: [],
        prompts: [],
        projects: [],
        gitSettings: [],
      };
      await writeDb(initialData);
      return initialData;
    }
    logger.error(`Error reading from db.json: ${error.message}`);
    throw new Error("Could not read from database.");
  }
};
const writeDb = async (data) => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    logger.error(`Error writing to db.json: ${error.message}`);
    throw new Error("Could not write to database.");
  }
};
module.exports = {
  readDb,
  writeDb,
};
