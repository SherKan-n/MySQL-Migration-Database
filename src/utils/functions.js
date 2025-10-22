async function checkTableMigrations(connection) {
    try {
        await connection.promise().query("SELECT `id` FROM `migrations` LIMIT 1;");
        return true;
    } catch (error) {
        if (error && error.code === "ER_NO_SUCH_TABLE") return false;
        throw error;
    }
}
//---------------------------------------
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
//---------------------------------------
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
//---------------------------------------
async function getCurrentBatch(connection) {
    const [results] = await connection
        .promise()
        .query("SELECT `batch` FROM `migrations` ORDER BY `batch` DESC LIMIT 1;");
    return Array.isArray(results) && results.length > 0 ? results[0].batch : 0;
}
//---------------------------------------
async function insertMigration(connection, migration, batch) {
    const query = "INSERT INTO `migrations` (`migration`, `batch`) VALUES (?, ?);";
    await connection.promise().query(query, [migration, batch]);
    return true;
}
//---------------------------------------
async function deleteMigration(connection, migration, batch) {
    const query = "DELETE FROM `migrations` WHERE `migration` = ? AND `batch` > ?;";
    await connection.promise().query(query, [migration, batch]);
    return true;
}
//---------------------------------------
async function getAllBatches(connection) {
    const [results] = await connection.promise().query("SELECT `batch`, `migration` FROM `migrations`;");
    return Array.isArray(results) ? results : [];
}
//---------------------------------------
module.exports = {
    checkTableMigrations,
    createTableMigrations,
    getAllMigrations,
    getCurrentBatch,
    insertMigration,
    deleteMigration,
    getAllBatches,
};
