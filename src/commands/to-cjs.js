"use strict";
//---------------------------------------
const fs = require("fs");
const path = require("path");
//---------------------------------------
const currentPath = process.cwd();
const config = require(`${currentPath}/migrations/mysql-migration.config.json`);
//---------------------------------------
function convert_to_cjs(dbName) {
    //---------------------------------------
    const databases = Object.keys(config.databases);
    //---------------------------------------
    if (!databases.includes(dbName)) {
        console.error("\x1b[31m%s\x1b[0m", `Error: Invalid database name "${dbName}" can be: ${databases.join(", ")}.`);
        process.exit(1);
    }
    //---------------------------------------
    const migrationsDir = `${currentPath}/migrations/${dbName}_db`;
    if (!fs.existsSync(migrationsDir)) {
        console.error("\x1b[31m%s\x1b[0m", `Error: Migrations directory for "${dbName}" not found.`);
        process.exit(1);
    }
    //---------------------------------------
    const files = fs.readdirSync(migrationsDir);
    let convertedCount = 0;

    for (const file of files) {
        if (file.endsWith(".js")) {
            const filePath = path.join(migrationsDir, file);
            let content = fs.readFileSync(filePath, "utf8");

            // Simple check and replace for export default
            if (content.includes("export default")) {
                content = content.replace("export default", "module.exports =");
                fs.writeFileSync(filePath, content);
                console.log("\x1b[32m%s\x1b[0m", `Converted: "${file}" to CJS.`);
                convertedCount++;
            }
        }
    }

    if (convertedCount === 0) {
        console.log("\x1b[33m%s\x1b[0m", "No files needed conversion.");
    } else {
        console.log("\x1b[32m%s\x1b[0m", `\nSuccessfully converted ${convertedCount} files to CJS.`);
    }
}
//---------------------------------------
module.exports = convert_to_cjs;
