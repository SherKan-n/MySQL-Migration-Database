# MySQL Migration Database

A simple command-line tool for generating and running database migrations for MySQL.

## Installation

You can install `mysql-migration` using npm: `npm install mysql-migration`

### Initialize the migrations table

If you have not yet run any migrations, you need to initialize the migrations table by running the following command: `npx mysql-migration init`

<br>

## Configuration

The configuration file `mysql-migration.config.json` should export an object with the following properties:

- `host`: the MySQL server host
- `database`: the name of the database to migrate
- `user`: the MySQL user name
- `password`: the MySQL user password

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

<br>

## Usage

### Create a new migration

To create a new migration, run the following command:\
&emsp;`npx mysql-migration create migration-name database-name`

This will create a new migration file in the `migrations` directory with a timestamp and the name `migration-name`.

### Running migrations

To run pending migrations, run the following command:\
&emsp;`npx mysql-migration run database-name(optional)`

This will run all migrations that have not yet been run.

### Rolling back migrations

To roll back the last migration, run the following command:\
&emsp;`npx mysql-migration rollback database-name batch`

This will roll back migrations to the given batch number.

> **Copyright (c) 2023-present [𝐒𝐡𝐞𝐫𝐊𝐚𝐧](https://github.com/SherKan-n). All Rights Reserved.**
