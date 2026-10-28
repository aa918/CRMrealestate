#!/usr/bin/env node
/**
 * Convenience script that runs a REAL, local PostgreSQL server using the
 * `embedded-postgres` package (a genuine Postgres binary, downloaded once
 * and run from userspace - no admin rights, no Docker required).
 *
 * This is purely a local development/testing convenience for people who
 * don't already have PostgreSQL/Docker available. In production, or if
 * you already run Postgres another way, just point DATABASE_URL at it and
 * ignore this script entirely.
 */
const path = require("path");
const fs = require("fs");
const EmbeddedPostgres = require("embedded-postgres").default || require("embedded-postgres");

const DATA_DIR = path.join(__dirname, "..", ".pgdata");
const PORT = 55432;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "realestate_crm";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
});

function printConnectionInfo() {
  const url = `postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}?schema=public`;
  console.log("");
  console.log(`PostgreSQL is running on port ${PORT}.`);
  console.log(`Set this in backend/.env:`);
  console.log(`DATABASE_URL=${url}`);
  console.log("");
}

async function up() {
  const alreadyInitialised = fs.existsSync(path.join(DATA_DIR, "PG_VERSION"));
  if (!alreadyInitialised) {
    console.log("Initialising local PostgreSQL data directory (first run only)...");
    await pg.initialise();
  }
  console.log("Starting local PostgreSQL...");
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
  } catch (err) {
    // Database already exists - that's fine.
  }
  printConnectionInfo();
}

async function down() {
  console.log("Stopping local PostgreSQL...");
  try {
    await pg.stop();
    console.log("Stopped.");
  } catch (err) {
    console.log("PostgreSQL was not running.");
  }
}

const command = process.argv[2];

(async () => {
  if (command === "up") await up();
  else if (command === "down") await down();
  else {
    console.log("Usage: node scripts/pg-local.js <up|down>");
    process.exit(1);
  }
})().catch((err) => {
  console.error("pg-local script failed:", err.message);
  process.exit(1);
});
