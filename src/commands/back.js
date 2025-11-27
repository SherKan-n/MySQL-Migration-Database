"use strict";
//==============================================================================
const fs = require("fs");
const mysql = require("mysql2");
const path = require("path");
//---------------------------------------
const currentPath = process.cwd();
const configPath = path.join(currentPath, "migrations", "mysql-migration.config.json");
if (!fs.existsSync(configPath)) {
    console.error(
        "\x1b[31m%s\x1b[0m",
        'Error: Config file "mysql-migration.config.json" not found. Run "mysql-migration init" first.'
    );
    process.exit(1);
}
const config = require(configPath);
const {
    checkTableMigrations,
    createTableMigrations,
    getAllMigrations,
    getCurrentBatch,
    deleteMigration,
} = require("../utils/functions");
const { loadModule } = require("../utils/moduleLoader");
//==============================================================================
async function back_migration(dbName, batch) {
    const connection = {};
    const databases = config.databases;

    //---------------------------------------
    if (dbName) {
        const batchNumber = parseInt(batch);
        if (isNaN(batchNumber)) {
            console.error("\x1b[31m%s\x1b[0m", `Error: Invalid batch number.`);
            process.exit(1);
        }
        //---------------------------------------
        if (!databases[dbName]) {
            console.error("\x1b[31m%s\x1b[0m", `Error: Invalid database name "${dbName}".`);
            process.exit(1);
        }
        //---------------------------------------
        connection[dbName] = mysql.createConnection(databases[dbName]);
        try {
            await connection[dbName].promise().connect();
        } catch (err) {
            console.error("\x1b[31m%s\x1b[0m", `Error: Unable to connect to database "${dbName}".\n${err}`);
            process.exit(1);
        }
        //---------------------------------------
        const tableMigrations = await checkTableMigrations(connection[dbName]);
        if (!tableMigrations) await createTableMigrations(connection[dbName]);
        //---------------------------------------
        const currentBatch = await getCurrentBatch(connection[dbName]);
        if (batchNumber >= currentBatch) {
            console.error("\x1b[31m%s\x1b[0m", `Error: Invalid batch number, the current batch is "${currentBatch}".`);
            await connection[dbName].promise().end();
            process.exit(1);
        }
        const migrations = await getAllMigrations(connection[dbName], batchNumber);
        if (migrations.length === 0) {
            console.log("\x1b[32m%s\x1b[0m", `Nothing to rollback for batch greater than ${batchNumber}.`);
            await connection[dbName].promise().end();
            process.exit(0);
        }
        //---------------------------------------
        for (let file of migrations) {
            if (!fs.existsSync(`${currentPath}/migrations/${dbName}_db/${file.migration}.js`)) {
                console.warn("\x1b[33m%s\x1b[0m", `Warning: Migration "${file.migration}" not found.`);
            } else {
                const migrationPath = `${currentPath}/migrations/${dbName}_db/${file.migration}.js`;
                const migration = await loadModule(migrationPath);
                try {
                    await migration.down(connection[dbName]);
                    await deleteMigration(connection[dbName], file.migration, batchNumber);
                    console.log(
                        "\x1b[32m%s\x1b[0m",
                        `Migration "${file.migration}" has been successfully rolled back.`
                    );
                } catch (err) {
                    console.warn("\x1b[33m%s\x1b[0m", `Warning: "${err}" in migration "${file.migration}".`);
                }
            }
        }
        await connection[dbName].promise().end();
    } else console.error("\x1b[31m%s\x1b[0m", `Error: Database name is empty !`);
}
//==============================================================================
module.exports = back_migration;
