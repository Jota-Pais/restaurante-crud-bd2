// =====================================================================
//  Setup automático do banco (caminho "local", pra quem já tem Postgres).
//
//  O que faz:
//    1. Conecta no banco de manutenção "postgres".
//    2. Cria o banco alvo (PGDATABASE, padrão "restaurante") se não existir.
//    3. Conecta nele, zera o schema e roda database/schema.sql + seed.sql.
//
//  É IDEMPOTENTE: pode rodar quantas vezes quiser. Antes de criar as tabelas
//  ele faz "DROP SCHEMA public CASCADE; CREATE SCHEMA public;", então rodar de
//  novo não dá erro de "relação já existe".
//
//  IMPORTANTE: database/schema.sql e database/seed.sql continuam PUROS (só SQL),
//  porque são os arquivos anexados na entrega do portal da faculdade. Toda a
//  lógica de (re)criação fica aqui, neste script — não nos .sql.
// =====================================================================

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Garante um server/.env mesmo se a pessoa esqueceu de copiar o exemplo.
const envPath = path.join(__dirname, "..", ".env");
const envExample = path.join(__dirname, "..", ".env.example");
if (!fs.existsSync(envPath) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envPath);
  console.log("• server/.env não existia — criei a partir do .env.example.");
  console.log("  Se a senha do seu PostgreSQL não for 'postgres', ajuste o server/.env.");
}
require("dotenv").config({ path: envPath });

const databaseDir = path.join(__dirname, "..", "..", "database");
const schemaSql = fs.readFileSync(path.join(databaseDir, "schema.sql"), "utf8");
const seedSql = fs.readFileSync(path.join(databaseDir, "seed.sql"), "utf8");

const targetDb = process.env.PGDATABASE || "restaurante";

async function run() {
  // 1) Banco de manutenção — necessário pra poder dar CREATE DATABASE.
  const admin = new Client({ database: "postgres" });
  await admin.connect();

  const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);
  if (rowCount === 0) {
    // CREATE DATABASE não aceita parâmetro ($1); validamos o nome antes de interpolar.
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(targetDb)) {
      throw new Error(`Nome de banco inválido em PGDATABASE: "${targetDb}".`);
    }
    await admin.query(`CREATE DATABASE "${targetDb}"`);
    console.log(`✓ Banco "${targetDb}" criado.`);
  } else {
    console.log(`• Banco "${targetDb}" já existe — vou recriar as tabelas.`);
  }
  await admin.end();

  // 2) Conecta no banco alvo e (re)cria tudo do zero.
  const db = new Client({ database: targetDb });
  await db.connect();
  try {
    console.log("• Zerando o schema (DROP SCHEMA public CASCADE; CREATE SCHEMA public)…");
    await db.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");

    console.log("• Rodando database/schema.sql (8 tabelas)…");
    await db.query(schemaSql);

    console.log("• Rodando database/seed.sql (dados de exemplo)…");
    await db.query(seedSql);
  } finally {
    await db.end();
  }

  console.log(`\n✓ Pronto! Banco "${targetDb}" criado e populado.`);
  console.log("  Agora rode:  npm run dev   →  http://localhost:5173");
}

run().catch((err) => {
  console.error("\n✗ Não foi possível preparar o banco.");
  console.error("  " + err.message);
  console.error("  Verifique o server/.env (host, porta, usuário, senha) e se o PostgreSQL está rodando.");
  process.exit(1);
});
