'use strict';
//==============================================================================
const mysql = require('mysql2');
//---------------------------------------
const currentPath = process.cwd();
const config = require(`${currentPath}/migrations/mysql-migration.config.json`);
const { checkTableMigrations, createTableMigrations, getAllBatches, getCurrentBatch } = require("../utils/functions");
//==============================================================================
async function show_batched_migrations(dbName) {
    const connection = {};
    const databases = config.databases;
    //---------------------------------------
    if (dbName) {
        if (!databases[dbName]) {
            console.error('\x1b[31m%s\x1b[0m', `Error: Invalid database name "${dbName}".`);
            process.exit(1);
        }
        //---------------------------------------
        connection[dbName] = mysql.createConnection(databases[dbName]);
        connection[dbName].connect((err) => {
            if (err) {
                console.error('\x1b[31m%s\x1b[0m', `Error: Unable to connect to database "${dbName}".\n${err}`);
                process.exit(1);
            }
        });
        //---------------------------------------
        const tableMigrations = checkTableMigrations(connection[dbName]);
        if (!tableMigrations) createTableMigrations(connection[dbName]);
        //---------------------------------------
        const currentBatch = await getCurrentBatch(connection[dbName]);
        //---------------------------------------
        getAllBatches(connection[dbName]).then((migrations) => {
            if (migrations.length > 0) {
                console.log('\x1b[32m%s\x1b[0m', `Batched migrations for database "${dbName}":`);
                migrations.forEach((migration) => {
                    const migrationName = migration.migration.split('_').slice(4).join('_');
                    console.log(`[Batch ${migration.batch}] - ${migrationName}`);
                });
            }
            else console.log('\x1b[32m%s\x1b[0m', `No batched migrations for database "${dbName}".`);
            connection[dbName].end();
        }).catch((err) => {
            console.error('\x1b[31m%s\x1b[0m', `Error: ${err}`);
            connection[dbName].end();
        }).finally(() => {
            console.log('\x1b[36m%s\x1b[0m', `Current batch for database "${dbName}": ${currentBatch}`);
        });
    }
    else console.error('\x1b[31m%s\x1b[0m', `Error: Database name is empty !`);
}
//==============================================================================
module.exports = show_batched_migrations;