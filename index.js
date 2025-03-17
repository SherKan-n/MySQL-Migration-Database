#!/usr/bin/env node
const program = require('commander');
//---------------------------------------
program
   .command('help')
   .description('Show all available commands')
   .action(() => {
      console.log(`\nUsage: cli-tool <command> [options]\n`);
      console.log(`Available commands:\n`);
      console.log(`  init                      Initialize migration`);
      console.log(`  run [dbName]              Run migration`);
      console.log(`  rollback <dbName> <batch> Rollback migration`);
      console.log(`  create <name> <dbName>    Create a new migration`);
      console.log(`  batch <dbName>            Get the batched migrations`);
      console.log(`  help                      Show this help message\n`);
   });
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
program
   .command('batch <dbName>')
   .description('Get the batched migrations')
   .action(() => require('./src/commands/batch'));
//---------------------------------------
program.parse(process.argv);