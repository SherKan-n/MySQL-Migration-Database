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
    insertMigration,
    withTransaction,
} = require("../utils/functions");
const { loadModule } = require("../utils/moduleLoader");

/**
 * Run migration with optional dry-run mode.
 * @param {string|null} dbName - Target database name or null to process all databases.
 * @param {boolean} dryRun - When true, preview migrations without executing them.
 * @param {boolean} useTransaction - When true, wrap migrations in a transaction per database.
 * @returns {Promise<void>}
 */
async function run_migration(dbName, dryRun = false, useTransaction = false) {
    const config = loadConfig(configPath);
    const connectionManager = new ConnectionManager();

    try {
        if (dbName) {
            if (!isValidDatabase(dbName, config)) {
                console.error("\x1b[31m%s\x1b[0m", `Error: Invalid database name "${dbName}".`);
                process.exit(1);
            }
            await runForDatabase(dbName, config, connectionManager, dryRun, useTransaction);
        } else {
            await runForAllDatabases(config, connectionManager, dryRun, useTransaction);
        }
    } finally {
        await connectionManager.closeAll();
    }
}

/**
 * Run migrations for a single database.
 * @param {string} dbName - Database identifier.
 * @param {{databases: Record<string, any>}} config - Loaded migration configuration.
 * @param {ConnectionManager} connectionManager - Shared connection manager instance.
 * @param {boolean} dryRun - Whether to preview migrations only.
 * @param {boolean} useTransaction - Whether to wrap execution in a transaction.
 * @returns {Promise<void>}
 */
async function runForDatabase(dbName, config, connectionManager, dryRun, useTransaction) {
    const dbConfig = getDatabaseConfig(dbName, config);
    const migrationsDir = path.join(currentPath, "migrations", `${dbName}_db`);

    await connectionManager.withConnection(dbName, dbConfig, async (connection) => {
        const tableMigrations = await checkTableMigrations(connection);
        if (!tableMigrations) await createTableMigrations(connection);

        const batch = (await getCurrentBatch(connection)) + 1;
        const allMigrations = await getAllMigrations(connection);

        if (!fs.existsSync(migrationsDir)) {
            console.log("\x1b[32m%s\x1b[0m", "Nothing to migrate.\n");
            return;
        }

        const migrationFiles = fs.readdirSync(migrationsDir);
        const pendingMigrations = migrationFiles.filter(
            (val) => !allMigrations.some((val2) => val.includes(val2.migration))
        );

        if (pendingMigrations.length === 0) {
            console.log("\x1b[32m%s\x1b[0m", "Nothing to migrate.\n");
            return;
        }

        if (dryRun) {
            console.log("\x1b[33m%s\x1b[0m", `Dry-run mode: Previewing migrations for database "${dbName}":\n`);
            for (let file of pendingMigrations) {
                console.log(`  Would migrate: "${file}"`);
            }
            console.log(`\nBatch: ${batch}`);
            return;
        }

        const executeMigration = async (connection) => {
            for (let file of pendingMigrations) {
                const migrationPath = path.join(migrationsDir, file);
                const migration = await loadModule(migrationPath);
                try {
                    await migration.up(connection);
                    await insertMigration(connection, file.replace(".js", ""), batch);
                    console.log("\x1b[36m%s\x1b[0m", `Migrated: "${file}" successfully.`);
                } catch (err) {
                    console.warn("\x1b[33m%s\x1b[0m", `Warning: "${err}" in migration "${file}".`);
                    throw err;
                }
            }
        };

        if (useTransaction) {
            await withTransaction(connection, executeMigration);
        } else {
            await executeMigration(connection);
        }

        console.log("\x1b[32m%s\x1b[0m", "All migrations have been completed successfully.\n");
    });
}

/**
 * Run migrations for all configured databases.
 * @param {{databases: Record<string, any>}} config - Loaded migration configuration.
 * @param {ConnectionManager} connectionManager - Shared connection manager instance.
 * @param {boolean} dryRun - Whether to preview migrations only.
 * @param {boolean} useTransaction - Whether to wrap execution in transactions.
 * @returns {Promise<void>}
 */
async function runForAllDatabases(config, connectionManager, dryRun, useTransaction) {
    const databases = config.databases;
    const migrations = [];

    for (let key in databases) {
        const dbConfig = getDatabaseConfig(key, config);
        const migrationsDir = path.join(currentPath, "migrations", `${key}_db`);

        try {
            await connectionManager.createConnection(key, dbConfig);
            const connection = connectionManager.getConnection(key);

            const tableMigrations = await checkTableMigrations(connection);
            if (!tableMigrations) await createTableMigrations(connection);

            const batch = (await getCurrentBatch(connection)) + 1;
            const allMigrations = await getAllMigrations(connection);

            if (!fs.existsSync(migrationsDir)) continue;

            const migrationFiles = fs.readdirSync(migrationsDir);
            const diffMigrations = migrationFiles.filter(
                (val) => !allMigrations.some((val2) => val.includes(val2.migration))
            );

            for (let m of diffMigrations) migrations.push([m, key, batch]);
        } catch (err) {
            console.error("\x1b[31m%s\x1b[0m", `Error: Unable to connect to database "${key}".`);
            process.exit(1);
        }
    }

    if (migrations.length === 0) {
        console.log("\x1b[32m%s\x1b[0m", "Nothing to migrate.\n");
        return;
    }

    if (dryRun) {
        console.log("\x1b[33m%s\x1b[0m", "Dry-run mode: Previewing migrations:\n");
        for (let [file, key, batch] of migrations) {
            console.log(`  Would migrate: "${file}" in database "${key}" [Batch ${batch}]`);
        }
        return;
    }

    for (let [file, key, batch] of migrations) {
        const connection = connectionManager.getConnection(key);
        const migrationPath = path.join(currentPath, "migrations", `${key}_db`, file);
        const migration = await loadModule(migrationPath);

        const executeMigration = async (conn) => {
            try {
                await migration.up(conn);
                await insertMigration(conn, file.replace(".js", ""), batch);
                console.log("\x1b[36m%s\x1b[0m", `Migrated: "${file}" in database "${key}" successfully.`);
            } catch (err) {
                console.warn("\x1b[33m%s\x1b[0m", `Warning: "${err}" in migration "${file}" in database "${key}".`);
                throw err;
            }
        };

        if (useTransaction) {
            await withTransaction(connection, executeMigration);
        } else {
            await executeMigration(connection);
        }
    }

    console.log("\x1b[32m%s\x1b[0m", "All migrations have been completed successfully.\n");
}

module.exports = run_migration;
