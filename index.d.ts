import { Connection } from "mysql2";

/**
 * Database configuration for migrations
 */
export interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
}

/**
 * Migration configuration file structure
 */
export interface MigrationConfig {
    databases: Record<string, DatabaseConfig>;
}

/**
 * Migration file interface
 */
export interface Migration {
    /**
     * Run the migration
     * @param connection - MySQL connection
     */
    up(connection: Connection): Promise<void>;

    /**
     * Rollback the migration
     * @param connection - MySQL connection
     */
    down(connection: Connection): Promise<void>;
}

/**
 * Migration record from database
 */
export interface MigrationRecord {
    migration: string;
    batch: number;
}

/**
 * Connection manager for handling database connections
 */
export declare class ConnectionManager {
    constructor();
    createConnection(name: string, config: DatabaseConfig): Promise<Connection>;
    getConnection(name: string): Connection | undefined;
    closeConnection(name: string): Promise<void>;
    closeAll(): Promise<void>;
    withConnection<T>(
        name: string,
        config: DatabaseConfig,
        callback: (connection: Connection) => Promise<T>
    ): Promise<T>;
    withCleanup<T>(callback: () => Promise<T>): Promise<T>;
}

/**
 * Configuration utility functions
 */
export declare function loadConfig(configPath: string): MigrationConfig;
export declare function getDatabaseConfig(dbName: string, config: MigrationConfig): DatabaseConfig;
export declare function getDatabaseNames(config: MigrationConfig): string[];
export declare function isValidDatabase(dbName: string, config: MigrationConfig): boolean;

/**
 * Database utility functions
 */
export declare function checkTableMigrations(connection: Connection): Promise<boolean>;
export declare function createTableMigrations(connection: Connection): Promise<boolean>;
export declare function getAllMigrations(connection: Connection, batch?: number | null): Promise<MigrationRecord[]>;
export declare function getCurrentBatch(connection: Connection): Promise<number>;
export declare function insertMigration(connection: Connection, migration: string, batch: number): Promise<boolean>;
export declare function deleteMigration(connection: Connection, migration: string, batch: number): Promise<boolean>;
export declare function getAllBatches(connection: Connection): Promise<MigrationRecord[]>;
export declare function beginTransaction(connection: Connection): Promise<void>;
export declare function commitTransaction(connection: Connection): Promise<void>;
export declare function rollbackTransaction(connection: Connection): Promise<void>;
export declare function withTransaction<T>(
    connection: Connection,
    callback: (connection: Connection) => Promise<T>
): Promise<T>;

/**
 * Module loader for CJS and ESM migrations
 */
export declare function loadModule(filePath: string): Promise<Migration>;
