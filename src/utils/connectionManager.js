"use strict";

const mysql = require("mysql2");

/**
 * Connection manager for handling database connections with proper cleanup
 */
class ConnectionManager {
    constructor() {
        /** @type {Map<string, import('mysql2').Connection>} */
        this.connections = new Map();
    }

    /**
     * Create a new database connection
     * @param {string} name - Connection name/identifier
     * @param {import('mysql2').ConnectionOptions} config - Database configuration
     * @returns {Promise<import('mysql2').Connection>}
     */
    async createConnection(name, config) {
        if (this.connections.has(name)) {
            throw new Error(`Connection "${name}" already exists`);
        }

        const connection = mysql.createConnection(config);
        await connection.promise().connect();
        this.connections.set(name, connection);
        return connection;
    }

    /**
     * Get an existing connection
     * @param {string} name - Connection name/identifier
     * @returns {import('mysql2').Connection|undefined}
     */
    getConnection(name) {
        return this.connections.get(name);
    }

    /**
     * Close a specific connection
     * @param {string} name - Connection name/identifier
     * @returns {Promise<void>}
     */
    async closeConnection(name) {
        const connection = this.connections.get(name);
        if (connection) {
            await connection.promise().end();
            this.connections.delete(name);
        }
    }

    /**
     * Close all connections
     * @returns {Promise<void>}
     */
    async closeAll() {
        const closePromises = [];
        for (const [name, connection] of this.connections.entries()) {
            closePromises.push(
                connection.promise().end().catch((err) => {
                    console.warn(`Warning: Error closing connection "${name}": ${err.message}`);
                })
            );
        }
        await Promise.all(closePromises);
        this.connections.clear();
    }

    /**
     * Execute a callback with automatic connection cleanup
     * @template T
     * @param {string} name - Connection name/identifier
     * @param {import('mysql2').ConnectionOptions} config - Database configuration
     * @param {(connection: import('mysql2').Connection) => Promise<T>} callback - Function to execute with the connection
     * @returns {Promise<T>}
     */
    async withConnection(name, config, callback) {
        const connection = await this.createConnection(name, config);
        try {
            return await callback(connection);
        } finally {
            await this.closeConnection(name);
        }
    }

    /**
     * Execute a callback with automatic cleanup of all connections
     * @template T
     * @param {() => Promise<T>} callback - Function to execute
     * @returns {Promise<T>}
     */
    async withCleanup(callback) {
        try {
            return await callback();
        } finally {
            await this.closeAll();
        }
    }
}

module.exports = ConnectionManager;
