'use strict';
//---------------------------------------
const fs = require('fs');
//---------------------------------------
const currentPath = process.cwd();
//---------------------------------------
if (!fs.existsSync(`${currentPath}/migrations`)) fs.mkdirSync(`${currentPath}/migrations`);
if (!fs.existsSync(`${currentPath}/migrations/mysql-migration.config.json`)) fs.writeFileSync(`${currentPath}/migrations/mysql-migration.config.json`, JSON.stringify({
   "databases": {
      "db_name": {
         "host": "db_host",
         "user": "db_user",
         "password": "db_password",
         "database": "db_name"
      }
   }
}, null, 3));
console.log('\x1b[32m%s\x1b[0m', `Created migration config file: "mysql-migration.config.json" in the "migrations" directory.`);