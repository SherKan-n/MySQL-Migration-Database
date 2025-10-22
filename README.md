<div align="center">

# 🗄️ MySQL Migration Database

**A command-line companion that helps you manage versioned MySQL schema changes from your Node.js projects.**

[![npm version](https://img.shields.io/npm/v/mysql-migration.svg?style=flat-square)](https://www.npmjs.com/package/mysql-migration)&nbsp;&nbsp;
[![License](https://img.shields.io/badge/license-Custom-blue.svg?style=flat-square)](LICENSE.md)&nbsp;&nbsp;
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg?style=flat-square)](https://nodejs.org/)

</div>

---

## ✨ Features

- 🎯 **Multi-database support** — Orchestrate migrations across different environments
- ⏱️ **Timestamped migration files** — Generated with a single command
- ⚡ **Forward and backward execution** — Run or roll back batches confidently
- 🔧 **Scriptable CLI** — Plugs into CI/CD pipelines via standard Node.js tooling
- 📦 **Zero dependencies** — Lightweight and fast

## 📋 Prerequisites

- **Node.js** v16 or later.
- **MySQL** instance reachable from where you run the CLI.
- A project workspace where you can store migration files and configuration.

## 📦 Installation

Install locally within your project:

```bash
npm install --save-dev mysql-migration
```

Or run ad hoc without installing by prefixing commands with `npx`.

## 🚀 Quick Start

**1️⃣ Create a configuration file**

Create `mysql-migration.config.json` in your project root (see [Configuration](#%EF%B8%8F-configuration)).

**2️⃣ Initialize the migrations table**

```bash
npx mysql-migration init
```

**3️⃣ Generate your first migration**

```bash
npx mysql-migration create add_users_table main-db
```

**4️⃣ Apply pending migrations**

```bash
npx mysql-migration run main-db
```

## ⚙️ Configuration

The CLI reads settings from `mysql-migration.config.json`. Define each database you manage inside the `databases` object. Every entry requires the connection credentials documented below:

- `host`: MySQL server host name or IP.
- `database`: Database schema name.
- `user`: User with migration privileges.
- `password`: Corresponding password.

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

Add as many database entries as you need. You can then target each one via the CLI commands below.

## 📖 Usage

### 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npx mysql-migration help` | 📚 Show all available commands |
| `npx mysql-migration init` | 🎬 Initialize the migrations table |
| `npx mysql-migration create <name> <dbName>` | ✏️ Scaffold a timestamped migration file |
| `npx mysql-migration run [dbName]` | ▶️ Execute all pending migrations |
| `npx mysql-migration rollback <dbName> <batch>` | ⏪ Roll back migrations to specified batch |
| `npx mysql-migration batch <dbName>` | 📊 Display recorded batches |

### ✏️ Create a New Migration

```bash
npx mysql-migration create migration-name database-name
```

A new file appears in the `migrations/` directory, timestamped and ready for your SQL `up` and `down` statements.

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

## 🔧 Troubleshooting

- **Authentication errors**: Verify credentials in `mysql-migration.config.json` match your MySQL user.
- **Connection refused**: Ensure the MySQL server accepts remote connections from your host and the port is open.
- **Missing migrations folder**: Run `npx mysql-migration init` to scaffold the `migrations/` directory and configuration file.

## 💬 Support

Use `npx mysql-migration help` to review commands, or open an issue on the repository if you encounter bugs or have enhancement ideas.

---

<div align="center">

### 📄 License

This project is distributed under a **custom non-commercial license**. Please review [`LICENSE.md`](LICENSE.md) for the full terms before using the software.

Made with ❤️ by [SherKan](https://github.com/SherKan-n)

</div>
