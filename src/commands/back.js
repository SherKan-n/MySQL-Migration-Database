'use strict';
//==============================================================================
const fs = require('fs');
const mysql = require('mysql');
//---------------------------------------
const currentPath = process.cwd();
const config = require(`${currentPath}/migrations/mysql-migration.config.json`);
const { checkTableMigrations, createTableMigrations, getAllMigrations, getCurrentBatch, deleteMigration } = require("../utils/functions");
//==============================================================================
async function back_migration(dbName, batch) {
   const connection = {};
   const databases = config.databases;
   //---------------------------------------
   if (dbName) {
      const batchNumber = parseInt(batch);
      if (isNaN(batchNumber)) {
         console.error('\x1b[31m%s\x1b[0m', `Error: Invalid batch number.`);
         process.exit(1);
      }
      //---------------------------------------
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
      const tableMigrations = await checkTableMigrations(connection[dbName]);
      if (!tableMigrations) await createTableMigrations(connection[dbName]);
      //---------------------------------------
      const currentBatch = await getCurrentBatch(connection[dbName]);
      if (batchNumber >= currentBatch) {
         console.error('\x1b[31m%s\x1b[0m', `Error: Invalid batch number, the current batch is "${currentBatch}".`);
         process.exit(1);
      }
      const migrations = await getAllMigrations(connection[dbName], batchNumber);
      //---------------------------------------
      for (let file of migrations) {
         if (!fs.existsSync(`${currentPath}/migrations/${dbName}_db/${file.migration}.js`)) {
            console.warn('\x1b[33m%s\x1b[0m', `Warning: Migration "${file.migration}" not found.`);
         }
         else {
            const migration = require(`${currentPath}/migrations/${dbName}_db/${file.migration}`);
            try {
               await migration.down(connection[dbName]);
               await deleteMigration(connection[dbName], file.migration, batchNumber);
               console.log('\x1b[32m%s\x1b[0m', `Migration "${file.migration}" has been successfully rolled back.`);
            }
            catch (err) {
               console.warn('\x1b[33m%s\x1b[0m', `Warning: "${err}" in migration "${file.migration}".`);
            }
         }
      }
      connection[dbName].end();
   }
   else console.error('\x1b[31m%s\x1b[0m', `Error: Database name is empty !`);
}
//==============================================================================
module.exports = back_migration;