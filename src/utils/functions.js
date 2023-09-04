function checkTableMigrations(connection) {
   return new Promise((resolve) => {
      connection.query("SELECT `id` FROM `migrations` LIMIT 1;", (error) => {
         if (error) resolve(false);
         else resolve(true);
      });
   });
}
//---------------------------------------
function createTableMigrations(connection) {
   return new Promise((resolve) => {
      const query = "CREATE TABLE `migrations` (\
         `id` INT NOT NULL AUTO_INCREMENT,\
         `migration` VARCHAR(255) NOT NULL,\
         `batch` INT NOT NULL DEFAULT 1,\
         `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\
         PRIMARY KEY (`id`));"
      connection.query(query, (error) => {
         if (error) throw error;
         resolve(true);
      });
   });
}
//---------------------------------------
function getAllMigrations(connection, batch = null) {
   return new Promise((resolve) => {
      let query = "SELECT `migration` FROM `migrations`";
      if (batch) query += " WHERE `batch` > ?;";
      connection.query(query, [batch], (error, results) => {
         if (error) throw error;
         if (results?.length > 0) resolve(results);
         else resolve([]);
      });
   });
}
//---------------------------------------
function getCurrentBatch(connection) {
   return new Promise((resolve) => {
      connection.query("SELECT `batch` FROM `migrations` ORDER BY `batch` DESC LIMIT 1;", (error, results) => {
         if (error) throw error;
         if (results?.length > 0) resolve(results[0].batch);
         else resolve(0);
      });
   });
}
//---------------------------------------
function insertMigration(connection, migration, batch) {
   return new Promise((resolve) => {
      const query = `INSERT INTO \`migrations\` (\`migration\`, \`batch\`) VALUES ('${migration}', '${batch}');`
      connection.query(query, (error) => {
         if (error) throw error;
         resolve(true);
      });
   });
}
//---------------------------------------
function deleteMigration(connection, migration, batch) {
   return new Promise((resolve) => {
      const query = `DELETE FROM \`migrations\` WHERE \`migration\` = '${migration}' AND \`batch\` > '${batch}';`
      connection.query(query, (error) => {
         if (error) throw error;
         resolve(true);
      });
   });
}
//---------------------------------------
module.exports = {
   checkTableMigrations, createTableMigrations, getAllMigrations, getCurrentBatch, insertMigration, deleteMigration
}