#!/usr/bin/env node
const program = require('commander');
//---------------------------------------
program
   .command('init')
   .description('Initialize migration')
   .action(() => require('./src/commands/init'));
//---------------------------------------
program
   .command('run [dbName]')
   .description('Run migration')
   .action((dbName) => require('./src/commands/run')(dbName));
//---------------------------------------
program
   .command('rollback <dbName> <batch>')
   .description('Rollback migration')
   .action((dbName, batch) => require('./src/commands/back')(dbName, batch));
//---------------------------------------
program
   .command('create <migrationName> <dbName>')
   .description('Create a new migration')
   .action((migrationName, dbName) => require('./src/commands/create')(migrationName, dbName));
//---------------------------------------
program.parse(process.argv);