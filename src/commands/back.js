"use strict";

const fs = require("fs");
const path = require("path");

const currentPath = process.cwd();
const configPath = path.join(currentPath, "migrations", "mysql-migration.config.json");

if (!fs.existsSync(configPath)) {
    console.error(
        "\x1b[31m%s\x1b[0m",
        'Error: Config file "mysql-migration.config.json" not found. Run "mysql-migration init" first.'
    );
    process.exit(1);
}

const ConnectionManager = require("../utils/connectionManager");
const { loadConfig, getDatabaseConfig, isValidDatabase } = require("../utils/config");
const {
    checkTableMigrations,
    createTableMigrations,
    getAllMigrations,
    getCurrentBatch,
    deleteMigration,
} = require("../utils/functions");
const { loadModule } = require("../utils/moduleLoader");

/**
 * Roll back previously applied migrations for a database.
 * @param {string} dbName - Target database name.
 * @param {string|number} batch - Batch number threshold for rollback.
 * @returns {Promise<void>}
 */
async function back_migration(dbName, batch) {
    if (!dbName) {
        console.error("\x1b[31m%s\x1b[0m", `Error: Database name is required.`);
        process.exit(1);
    }

    const batchNumber = parseInt(batch);
    if (isNaN(batchNumber)) {
        console.error("\x1b[31m%s\x1b[0m", `Error: Invalid batch number.`);
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
        const migrationsDir = path.join(currentPath, "migrations", `${dbName}_db`);

        await connectionManager.withConnection(dbName, dbConfig, async (connection) => {
            const tableMigrations = await checkTableMigrations(connection);
            if (!tableMigrations) await createTableMigrations(connection);

            const currentBatch = await getCurrentBatch(connection);
            if (batchNumber >= currentBatch) {
                console.error("\x1b[31m%s\x1b[0m", `Error: Invalid batch number, the current batch is "${currentBatch}".`);
                return;
            }

            const migrations = await getAllMigrations(connection, batchNumber);
            if (migrations.length === 0) {
                console.log("\x1b[32m%s\x1b[0m", `Nothing to rollback for batch greater than ${batchNumber}.`);
                return;
            }

            for (let file of migrations) {
                const migrationFile = path.join(migrationsDir, `${file.migration}.js`);
                if (!fs.existsSync(migrationFile)) {
                    console.warn("\x1b[33m%s\x1b[0m", `Warning: Migration "${file.migration}" not found.`);
                } else {
                    const migration = await loadModule(migrationFile);
                    try {
                        await migration.down(connection);
                        await deleteMigration(connection, file.migration, batchNumber);
                        console.log(
                            "\x1b[32m%s\x1b[0m",
                            `Migration "${file.migration}" has been successfully rolled back.`
                        );
                    } catch (err) {
                        console.warn("\x1b[33m%s\x1b[0m", `Warning: "${err}" in migration "${file.migration}".`);
                    }
                }
            }
        });
    } finally {
        await connectionManager.closeAll();
    }
}

module.exports = back_migration;
