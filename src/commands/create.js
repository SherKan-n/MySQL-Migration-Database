'use strict';
//---------------------------------------
const fs = require('fs');
const moment = require('moment');
//---------------------------------------
const currentPath = process.cwd();
const config = require(`${currentPath}/migrations/mysql-migration.config.json`);
//---------------------------------------
function create_migration(migrationName, dbName) {
   if (!migrationName) {
      console.error('\x1b[31m%s\x1b[0m', `Error: Migration name is empty !`);
      process.exit(1);
   }
   //---------------------------------------
   const databases = Object.keys(config.databases);
   //---------------------------------------
   if (!databases.includes(dbName)) {
      console.error('\x1b[31m%s\x1b[0m', `Error: Invalid database name "${dbName}" can be: ${databases.join(', ')}.`);
      process.exit(1);
   }
   //---------------------------------------
   if (!fs.existsSync(`${currentPath}/migrations/${dbName}_db`)) fs.mkdirSync(`${currentPath}/migrations/${dbName}_db`);
   //---------------------------------------
   const currentDate = moment().format('YYYY_MM_DD_HHmmss');
   const fileName = `${currentDate}_${migrationName}.js`;
   const filePath = `${currentPath}/migrations/${dbName}_db/${fileName}`;
   //---------------------------------------
   if (fs.existsSync(filePath)) console.warn('\x1b[33m%s\x1b[0m', `Warning: File "${fileName}" already exists in the "migrations" directory.`);
   else {
      const dataText = `module.exports = {
   up: (connection) => {
      const query = "";

      return new Promise((resolve, reject) => {
         if (!query) reject('Migration query is empty !');
         connection.query(query, (err) => {
            if (err) reject(err);
            resolve();
         });
      });
   },

   down: (connection) => {
      const query = "";

      return new Promise((resolve, reject) => {
         if (!query) reject('Migration query is empty !');
         connection.query(query, (err) => {
            if (err) reject(err);
            resolve();
         });
      });
   }
};`
      fs.writeFileSync(filePath, dataText);
      console.log('\x1b[32m%s\x1b[0m', `Created migration file: "${fileName}".`);
   }
}
//---------------------------------------
module.exports = create_migration;