'use strict';
//==============================================================================
const fs = require('fs');
const mysql = require('mysql2');
//---------------------------------------
const currentPath = process.cwd();
const config = require(`${currentPath}/migrations/mysql-migration.config.json`);
const { checkTableMigrations, createTableMigrations, getAllMigrations, getCurrentBatch, insertMigration } = require("../utils/functions");
//==============================================================================
async function run_migration(dbName) {
   const connection = {}, migrations = [];
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
      const tableMigrations = await checkTableMigrations(connection[dbName]);
      if (!tableMigrations) await createTableMigrations(connection[dbName]);
      //---------------------------------------
      const batch = await getCurrentBatch(connection[dbName]) + 1;
      const allMigrations = await getAllMigrations(connection[dbName]);
      const migration = fs.readdirSync(`${currentPath}/migrations/${dbName}_db`);
      //---------------------------------------
      const migrations = migration.filter(val => !allMigrations.some(val2 => val.includes(val2.migration)));
      //---------------------------------------
      if (migrations.length === 0) {
         console.log('\x1b[32m%s\x1b[0m', 'Nothing to migrate.\n');
         connection[dbName].end();
         process.exit(1);
      }
      //---------------------------------------
      for (let file of migrations) {
         const migration = require(`${currentPath}/migrations/${dbName}_db/${file}`);
         try {
            await migration.up(connection[dbName]);
            await insertMigration(connection[dbName], file.replace('.js', ''), batch);
            console.log('\x1b[36m%s\x1b[0m', `Migrated: "${file}" successfully.`);
         }
         catch (err) {
            console.warn('\x1b[33m%s\x1b[0m', `Warning: "${err}" in migration "${file}".`);
         }
      }
      console.log('\x1b[32m%s\x1b[0m', 'All migrations have been completed successfully.\n');
      connection[dbName].end();
   }
   else {
      for (let key in databases) {
         connection[key] = mysql.createConnection(databases[key]);
         connection[key].connect((err) => {
            if (err) {
               console.error('\x1b[31m%s\x1b[0m', `Error: Unable to connect to database "${key}".`);
               process.exit(1);
            }
         });
         //---------------------------------------
         const tableMigrations = await checkTableMigrations(connection[key]);
         if (!tableMigrations) await createTableMigrations(connection[key]);
         //---------------------------------------
         const batch = await getCurrentBatch(connection[key]) + 1;
         const allMigrations = await getAllMigrations(connection[key]);
         //---------------------------------------
         if (!fs.existsSync(`${currentPath}/migrations/${key}_db`)) continue;
         const migration = fs.readdirSync(`${currentPath}/migrations/${key}_db`);
         //---------------------------------------
         const diffMigrations = migration.filter(val => !allMigrations.some(val2 => val.includes(val2.migration)));
         //---------------------------------------
         for (let m of diffMigrations) migrations.push([m, key, batch]);
      }
      //---------------------------------------
      if (migrations.length === 0) {
         console.log('\x1b[32m%s\x1b[0m', 'Nothing to migrate.\n');
         for (let key in connection) connection[key].end();
         process.exit(1);
      }
      //---------------------------------------
      for (let [file, key, batch] of migrations) {
         const migration = require(`${currentPath}/migrations/${key}_db/${file}`);
         try {
            await migration.up(connection[key]);
            await insertMigration(connection[key], file.replace('.js', ''), batch);
            console.log('\x1b[36m%s\x1b[0m', `Migrated: "${file}" in database "${key}" successfully.`);
         }
         catch (err) {
            console.warn('\x1b[33m%s\x1b[0m', `Warning: "${err}" in migration "${file}" in database "${key}".`);
         }
      }
      console.log('\x1b[32m%s\x1b[0m', 'All migrations have been completed successfully.\n');
      for (let key in connection) connection[key].end();
   }
}
//==============================================================================
module.exports = run_migration;