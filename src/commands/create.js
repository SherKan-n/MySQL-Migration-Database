"use strict";

const fs = require("fs");
const dayjs = require("dayjs");
const path = require("path");

const currentPath = process.cwd();
const configPath = path.join(currentPath, "migrations", "mysql-migration.config.json");

const { loadConfig, getDatabaseNames, isValidDatabase } = require("../utils/config");

/**
 * Scaffold a new migration file for the selected database.
 * @param {string} migrationName - Slug for the migration file (no spaces recommended).
 * @param {string} dbName - Target database identifier.
 * @returns {void}
 */
function create_migration(migrationName, dbName) {
   if (!migrationName) {
      console.error("\x1b[31m%s\x1b[0m", `Error: Migration name is required.`);
      process.exit(1);
   }

   const config = loadConfig(configPath);
   const databases = getDatabaseNames(config);

   if (!isValidDatabase(dbName, config)) {
      console.error("\x1b[31m%s\x1b[0m", `Error: Invalid database name "${dbName}". Available databases: ${databases.join(", ")}.`);
      process.exit(1);
   }

   const migrationsDir = path.join(currentPath, "migrations", `${dbName}_db`);
   if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
   }

   const currentDate = dayjs().format("YYYY_MM_DD_HHmmss");
   const fileName = `${currentDate}_${migrationName}.js`;
   const filePath = path.join(migrationsDir, fileName);

   if (fs.existsSync(filePath)) {
      console.warn("\x1b[33m%s\x1b[0m", `Warning: File "${fileName}" already exists in the migrations directory.`);
      return;
   }

   let isEsm = false;
   try {
      const packageJsonPath = path.join(currentPath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
         const packageJson = require(packageJsonPath);
         if (packageJson.type === "module") {
            isEsm = true;
         }
      }
   } catch (e) {
      // Ignore error, default to CJS
   }

   const exportPrefix = isEsm ? "export default" : "module.exports =";

   const dataText = `${exportPrefix} {
   /**
    * Run the migration
    * @param {import('mysql2').Connection} connection
    */
   up: async (connection) => {
      const query = "";

      if (!query) {
         throw new Error('Migration query is empty.');
      }

      await connection.promise().query(query);
   },

   /**
    * Rollback the migration
    * @param {import('mysql2').Connection} connection
    */
   down: async (connection) => {
      const query = "";

      if (!query) {
         throw new Error('Migration query is empty.');
      }

      await connection.promise().query(query);
   }
};`;

   fs.writeFileSync(filePath, dataText);
   console.log("\x1b[32m%s\x1b[0m", `Created migration file: "${fileName}".`);
}

module.exports = create_migration;
