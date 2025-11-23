const path = require("path");
const { pathToFileURL } = require("url");

/**
 * Loads a module from the specified file path using dynamic import.
 * Handles both CommonJS and ES Modules.
 *
 * @param {string} filePath - The absolute path to the file.
 * @returns {Promise<any>} - The loaded module content.
 */
async function loadModule(filePath) {
    try {
        // Convert path to file URL for Windows compatibility with dynamic import
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(fileUrl);

        // If it's a CJS module loaded via import(), the default export holds the module.exports
        // If it's an ESM module, we return the module namespace object or specific exports
        // For this migration tool, we expect the migration object to be the default export or the module itself
        if (module.default) {
            return module.default;
        }
        return module;
    } catch (error) {
        throw new Error(`Failed to load module at ${filePath}: ${error.message}`);
    }
}

module.exports = { loadModule };
