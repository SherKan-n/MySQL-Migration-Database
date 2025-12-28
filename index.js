#!/usr/bin/env node
const { Command } = require("commander");
const program = new Command();

program
    .command("help")
    .description("Show all available commands")
    .action(() => {
        console.log(`\nUsage: mysql-migration <command> [options]\n`);
        console.log(`Available commands:\n`);
        console.log(`  init                      Initialize migration`);
        console.log(`  run [dbName]              Run migration (supports --dry-run, --transaction)`);
        console.log(`  rollback <dbName> <batch> Rollback migration`);
        console.log(`  create <name> <dbName>    Create a new migration`);
        console.log(`  batch <dbName>            Get the batched migrations`);
        console.log(`  to-esm <dbName>           Convert migrations to ESM`);
        console.log(`  to-cjs <dbName>           Convert migrations to CJS`);
        console.log(`  help                      Show this help message\n`);
        console.log(`Run command options:\n`);
        console.log(`  --dry-run, -d             Preview migrations without executing`);
        console.log(`  --transaction, -t         Use transactions for migrations (auto rollback on error)\n`);
    });

program
    .command("init")
    .description("Initialize migration")
    .action(() => require("./src/commands/init"));

program
    .command("run [dbName]")
    .description("Run migration")
    .option("-d, --dry-run", "Preview migrations without executing")
    .option("-t, --transaction", "Use transactions for migrations (auto rollback on error)")
    .action((dbName, options) => require("./src/commands/run")(dbName, options.dryRun, options.transaction));

program
    .command("rollback <dbName> <batch>")
    .description("Rollback migration")
    .action((dbName, batch) => require("./src/commands/back")(dbName, batch));

program
    .command("create <migrationName> <dbName>")
    .description("Create a new migration")
    .action((migrationName, dbName) => require("./src/commands/create")(migrationName, dbName));

program
    .command("batch <dbName>")
    .description("Get the batched migrations")
    .action((dbName) => require("./src/commands/batch")(dbName));

program
    .command("to-esm <dbName>")
    .description("Convert migrations to ESM")
    .action((dbName) => require("./src/commands/to-esm")(dbName));

program
    .command("to-cjs <dbName>")
    .description("Convert migrations to CJS")
    .action((dbName) => require("./src/commands/to-cjs")(dbName));

program.parse(process.argv);
