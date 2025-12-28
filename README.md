<div align="center">

# 🗄️ MySQL Migration Database

**A command-line companion that helps you manage versioned MySQL schema changes from your Node.js projects.**

[![npm version](https://img.shields.io/npm/v/mysql-migration.svg?style=flat-square)](https://www.npmjs.com/package/mysql-migration)&nbsp;&nbsp;
[![License](https://img.shields.io/badge/license-Custom-blue.svg?style=flat-square)](LICENSE.md)&nbsp;&nbsp;
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg?style=flat-square)](https://nodejs.org/)

</div>

---

## ✨ Features

- 🎯 **Multi-database support** — Orchestrate migrations across different environments
- ⏱️ **Timestamped migration files** — Generated with a single command
- ⚡ **Forward and backward execution** — Run or roll back batches confidently
- 🔧 **Scriptable CLI** — Plugs into CI/CD pipelines via standard Node.js tooling
- 🔐 **Transactional migrations** — Automatic rollback on failure
- 👁️ **Dry-run mode** — Preview migrations without executing
- 📘 **TypeScript support** — Full type definitions included

## 📋 Prerequisites

- **Node.js** v18 or later.
- **MySQL** instance reachable from where you run the CLI.
- A project workspace where you can store migration files and configuration.

## 📦 Installation

Install locally within your project:

```bash
npm install --save-dev mysql-migration
```

Or run ad hoc without installing by prefixing commands with `npx`.

## 🚀 Quick Start

**1️⃣ Initialize the project**

Run the init command to scaffold the `migrations/` directory and create a default configuration file:

```bash
npx mysql-migration init
```

**2️⃣ Configure your database**

Edit the generated `migrations/mysql-migration.config.json` file with your database credentials.

**3️⃣ Generate your first migration**

```bash
npx mysql-migration create add_users_table main-db
```

**4️⃣ Preview migrations (optional)**

```bash
npx mysql-migration run main-db --dry-run
```

**5️⃣ Apply pending migrations**

```bash
npx mysql-migration run main-db --transaction
```

## ⚙️ Configuration

The CLI reads settings from `mysql-migration.config.json`. Define each database you manage inside the `databases` object.

### Basic Configuration

```json
{
  "databases": {
    "db_name": {
      "host": "db_host",
      "user": "db_user",
      "password": "db_password",
      "database": "db_name"
    }
  }
}
```

## 📖 Usage

### 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npx mysql-migration help` | 📚 Show all available commands |
| `npx mysql-migration init` | 🎬 Scaffold migrations directory and config |
| `npx mysql-migration create <name> <dbName>` | ✏️ Scaffold a timestamped migration file |
| `npx mysql-migration run [dbName]` | ▶️ Execute all pending migrations |
| `npx mysql-migration run [dbName] --dry-run` | 👁️ Preview migrations without executing |
| `npx mysql-migration run [dbName] --transaction` | 🔐 Run migrations with automatic rollback on error |
| `npx mysql-migration rollback <dbName> <batch>` | ⏪ Roll back migrations to specified batch |
| `npx mysql-migration batch <dbName>` | 📊 Display recorded batches |
| `npx mysql-migration to-cjs <dbName>` | 🔄 Convert migrations to CommonJS |
| `npx mysql-migration to-esm <dbName>` | 🔄 Convert migrations to ESM |

### 🎬 Initialize Project

```bash
npx mysql-migration init
```

Scaffolds the `migrations/` directory and creates a default `mysql-migration.config.json` file. Run this once when setting up the tool in a new project.

### ✏️ Create a New Migration

```bash
npx mysql-migration create migration-name database-name
```

A new file appears in the `migrations/` directory, timestamped and ready for your SQL `up` and `down` statements. The generated migration uses modern async/await syntax:

```javascript
module.exports = {
   /**
    * Run the migration
    * @param {import('mysql2').Connection} connection
    */
   up: async (connection) => {
      const query = "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255))";
      await connection.promise().query(query);
   },

   /**
    * Rollback the migration
    * @param {import('mysql2').Connection} connection
    */
   down: async (connection) => {
      const query = "DROP TABLE users";
      await connection.promise().query(query);
   }
};
```

### 👁️ Dry-Run Mode

Preview migrations without executing them:

```bash
npx mysql-migration run main-db --dry-run
```

This is useful for CI/CD pipelines or production deployments where you want to verify what will change before applying it.

### 🔐 Transactional Migrations

Run migrations with automatic rollback on failure:

```bash
npx mysql-migration run main-db --transaction
```

If any migration fails, all migrations in the current batch will be automatically rolled back, keeping your database in a consistent state.

**Note:** Transactions work best with migrations that don't include DDL statements that cause implicit commits (like `CREATE TABLE`, `DROP TABLE`, etc. in MySQL).

### ▶️ Run Pending Migrations

```bash
npx mysql-migration run database-name
```

All migrations that have not yet been applied will run sequentially for the selected database.

### ⏪ Roll Back Migrations

```bash
npx mysql-migration rollback database-name batch
```

Use this when you need to revert the database state to the specified batch number.

### 📊 Inspect Batches

```bash
npx mysql-migration batch database-name
```

View the recorded batches to understand which migrations were executed together.

### 🔄 Convert Module System

If you need to switch your project between CommonJS (`require`) and ES Modules (`import/export`), you can batch convert your existing migration files.

**Convert to CommonJS:**

```bash
npx mysql-migration to-cjs database-name
```

**Convert to ES Modules:**

```bash
npx mysql-migration to-esm database-name
```

## 📘 TypeScript Support

The package includes full TypeScript type definitions. Import types in your project:

```typescript
import type { Migration, Connection } from 'mysql-migration';

// Your migration file can use these types
const myMigration: Migration = {
   up: async (connection: Connection) => {
      // ...
   },
   down: async (connection: Connection) => {
      // ...
   }
};
```

For IDE autocomplete support, ensure you have the package installed and your TypeScript configuration includes `node` types.

## 🔧 Troubleshooting

- **Authentication errors**: Verify credentials in `mysql-migration.config.json` match your MySQL user.
- **Connection refused**: Ensure the MySQL server accepts remote connections from your host and the port is open.
- **Missing migrations folder**: Run `npx mysql-migration init` to scaffold the `migrations/` directory and configuration file.
- **Connection leaks**: The tool now automatically manages connections with proper cleanup, even on errors.

## 🔒 Security Best Practices

1. **Limit access** to the machine or CI secrets storage that holds your config file
2. **Never commit** `mysql-migration.config.json` with real passwords to version control
3. **Use dry-run mode** before running migrations in production
4. **Use transactional migrations** for safer deployments

## 💬 Support

Use `npx mysql-migration help` to review commands, or open an issue on the repository if you encounter bugs or have enhancement ideas.

---

<div align="center">

### 📄 License

This project is distributed under a **custom non-commercial license**. Please review [`LICENSE.md`](LICENSE.md) for the full terms before using the software.

Made with ❤️ by [SherKan](https://github.com/SherKan-n)

</div>
