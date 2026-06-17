import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// O Pool usa automaticamente as variáveis PGHOST, PGPORT, PGDATABASE,
// PGUSER e PGPASSWORD definidas no arquivo .env.
export const pool = new Pool();

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("✓ Conectado ao PostgreSQL");
  } finally {
    client.release();
  }
}
