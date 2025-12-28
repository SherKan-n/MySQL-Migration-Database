"use strict";

const path = require("path");

const currentPath = process.cwd();
const configPath = path.join(currentPath, "migrations", "mysql-migration.config.json");

const ConnectionManager = require("../utils/connectionManager");
const { loadConfig, getDatabaseConfig, isValidDatabase } = require("../utils/config");
const { checkTableMigrations, createTableMigrations, getAllBatches, getCurrentBatch } = require("../utils/functions");

/**
 * Display migrations grouped by batch for a database.
 * @param {string} dbName - Target database name.
 * @returns {Promise<void>}
 */
async function show_batched_migrations(dbName) {
    if (!dbName) {
        console.error("\x1b[31m%s\x1b[0m", `Error: Database name is required.`);
        process.exit(1);
    }

    const config = loadConfig(configPath);
    const connectionManager = new ConnectionManager();

    try {
        if (!isValidDatabase(dbName, config)) {
            console.error("\x1b[31m%s\x1b[0m", `Error: Invalid database name "${dbName}".`);
            process.exit(1);
        }

        const dbConfig = getDatabaseConfig(dbName, config);

        await connectionManager.withConnection(dbName, dbConfig, async (connection) => {
            const tableMigrations = await checkTableMigrations(connection);
            if (!tableMigrations) await createTableMigrations(connection);

            const currentBatch = await getCurrentBatch(connection);
            const migrations = await getAllBatches(connection);

            if (migrations.length > 0) {
                console.log("\x1b[32m%s\x1b[0m", `Batched migrations for database "${dbName}":`);
                migrations.forEach((migration) => {
                    const migrationName = migration.migration.split("_").slice(4).join("_");
                    console.log(`[Batch ${migration.batch}] - ${migrationName}`);
                });
            } else {
                console.log("\x1b[32m%s\x1b[0m", `No batched migrations for database "${dbName}".`);
            }

            console.log("\x1b[36m%s\x1b[0m", `Current batch for database "${dbName}": ${currentBatch}`);
        });
    } finally {
        await connectionManager.closeAll();
    }
}

module.exports = show_batched_migrations;
