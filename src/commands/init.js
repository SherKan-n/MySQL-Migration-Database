"use strict";

const fs = require("fs");
const path = require("path");

const currentPath = process.cwd();

const migrationsDir = path.join(currentPath, "migrations");
const configPath = path.join(migrationsDir, "mysql-migration.config.json");

if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

if (!fs.existsSync(configPath)) {
    const defaultConfig = {
        databases: {
            db_name: {
                host: "db_host",
                user: "db_user",
                password: "db_password",
                database: "db_name",
            },
        },
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 3));
    console.log(
        "\x1b[32m%s\x1b[0m",
        `Created migration config file: "mysql-migration.config.json" in the "migrations" directory.`
    );
    console.log("\x1b[36m%s\x1b[0m", "\nTip: You can use environment variables to override config values:");
    console.log("  - DB_NAME_HOST, DB_NAME_USER, DB_NAME_PASSWORD, DB_NAME_DATABASE, DB_NAME_PORT");
} else {
    console.warn("\x1b[33m%s\x1b[0m", 'Config file "mysql-migration.config.json" already exists.');
}
