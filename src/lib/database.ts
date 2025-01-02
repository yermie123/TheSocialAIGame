"use server";
import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

const pool = new Pool({
  host: process.env.VITE_PG_HOST,
  port: parseInt(process.env.VITE_PG_PORT ?? "5432", 10),
  user: process.env.VITE_PG_USER,
  password: process.env.VITE_PG_PASSWORD,
  database: process.env.VITE_PG_DATABASE,
  ssl: {
    rejectUnauthorized: false, // Enable SSL with self-signed certificates
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20, // maximum number of clients in the pool
});

export { pool };
