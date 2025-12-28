"use strict";

const fs = require("fs");

/**
 * Load and parse configuration file
 * @param {string} configPath - Path to config file
 * @returns {{databases: Record<string, import('mysql2').ConnectionOptions>}}
 * @throws {Error} If config file not found or invalid
 */
function loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        throw new Error('Config file not found. Run "mysql-migration init" first.');
    }

    const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Validate config structure
    if (!rawConfig.databases || typeof rawConfig.databases !== "object") {
        throw new Error('Invalid config file: missing or invalid "databases" object');
    }

    return rawConfig;
}

/**
 * Get database configuration
 * @param {string} dbName - Database name
 * @param {{databases: Record<string, any>}} config - Raw config object
 * @returns {import('mysql2').ConnectionOptions}
 */
function getDatabaseConfig(dbName, config) {
    const dbConfig = config.databases[dbName];

    if (!dbConfig) {
        throw new Error(`Database "${dbName}" not found in configuration`);
    }

    return { ...dbConfig };
}

/**
 * Get all database names from config
 * @param {{databases: Record<string, any>}} config - Raw config object
 * @returns {string[]}
 */
function getDatabaseNames(config) {
    return Object.keys(config.databases);
}

/**
 * Validate database name exists in config
 * @param {string} dbName - Database name to validate
 * @param {{databases: Record<string, any>}} config - Raw config object
 * @returns {boolean}
 */
function isValidDatabase(dbName, config) {
    return dbName in config.databases;
}

module.exports = {
    loadConfig,
    getDatabaseConfig,
    getDatabaseNames,
    isValidDatabase,
};
