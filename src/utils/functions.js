/**
 * Check if the migrations table exists in the current database.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @returns {Promise<boolean>} True if the table exists, false if it needs to be created.
 */
async function checkTableMigrations(connection) {
    try {
        await connection.promise().query("SELECT `id` FROM `migrations` LIMIT 1;");
        return true;
    } catch (error) {
        if (error && error.code === "ER_NO_SUCH_TABLE") return false;
        throw error;
    }
}

/**
 * Create the migrations table.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @returns {Promise<boolean>} Resolves true when the table has been created.
 */
async function createTableMigrations(connection) {
    const query =
        "CREATE TABLE `migrations` (\
      `id` INT NOT NULL AUTO_INCREMENT,\
      `migration` VARCHAR(255) NOT NULL,\
      `batch` INT NOT NULL DEFAULT 1,\
      `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\
      PRIMARY KEY (`id`));";
    await connection.promise().query(query);
    return true;
}

/**
 * Retrieve migrations optionally filtered by batch.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @param {number|null} batch - Minimum batch number (exclusive) to filter results.
 * @returns {Promise<Array<{migration: string}>>} List of migrations.
 */
async function getAllMigrations(connection, batch = null) {
    let query = "SELECT `migration` FROM `migrations`";
    const params = [];
    if (batch !== null && batch !== undefined) {
        query += " WHERE `batch` > ?";
        params.push(batch);
    }
    const [results] = await connection.promise().query(`${query};`, params);
    return Array.isArray(results) ? results : [];
}

/**
 * Get the latest batch number applied to the database.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @returns {Promise<number>} Highest batch number or 0 if none exist.
 */
async function getCurrentBatch(connection) {
    const [results] = await connection
        .promise()
        .query("SELECT `batch` FROM `migrations` ORDER BY `batch` DESC LIMIT 1;");
    return Array.isArray(results) && results.length > 0 ? results[0].batch : 0;
}

/**
 * Record a migration as executed.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @param {string} migration - Migration identifier.
 * @param {number} batch - Batch number the migration belongs to.
 * @returns {Promise<boolean>} Resolves true after insertion.
 */
async function insertMigration(connection, migration, batch) {
    const query = "INSERT INTO `migrations` (`migration`, `batch`) VALUES (?, ?);";
    await connection.promise().query(query, [migration, batch]);
    return true;
}

/**
 * Remove a migration entry above the provided batch.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @param {string} migration - Migration identifier to delete.
 * @param {number} batch - Batch threshold; deletes records with batch greater than this value.
 * @returns {Promise<boolean>} Resolves true after deletion.
 */
async function deleteMigration(connection, migration, batch) {
    const query = "DELETE FROM `migrations` WHERE `migration` = ? AND `batch` > ?;";
    await connection.promise().query(query, [migration, batch]);
    return true;
}

/**
 * Retrieve all stored batches with their migrations.
 * @param {import('mysql2').Connection} connection - Active MySQL connection.
 * @returns {Promise<Array<{batch: number, migration: string}>>} List of batches and their migrations.
 */
async function getAllBatches(connection) {
    const [results] = await connection.promise().query("SELECT `batch`, `migration` FROM `migrations`;");
    return Array.isArray(results) ? results : [];
}

/**
 * Begin a transaction
 * @param {import('mysql2').Connection} connection
 */
async function beginTransaction(connection) {
    await connection.promise().query("START TRANSACTION");
}

/**
 * Commit a transaction
 * @param {import('mysql2').Connection} connection
 */
async function commitTransaction(connection) {
    await connection.promise().query("COMMIT");
}

/**
 * Rollback a transaction
 * @param {import('mysql2').Connection} connection
 */
async function rollbackTransaction(connection) {
    await connection.promise().query("ROLLBACK");
}

/**
 * Execute a callback within a transaction
 * @template T
 * @param {import('mysql2').Connection} connection
 * @param {(connection: import('mysql2').Connection) => Promise<T>} callback
 * @returns {Promise<T>}
 */
async function withTransaction(connection, callback) {
    await beginTransaction(connection);
    try {
        const result = await callback(connection);
        await commitTransaction(connection);
        return result;
    } catch (error) {
        await rollbackTransaction(connection);
        throw error;
    }
}

module.exports = {
    checkTableMigrations,
    createTableMigrations,
    getAllMigrations,
    getCurrentBatch,
    insertMigration,
    deleteMigration,
    getAllBatches,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    withTransaction,
};
