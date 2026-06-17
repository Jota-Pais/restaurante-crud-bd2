import { Router, Request, Response } from "express";
import { pool } from "./db";
import { handleDbError } from "./errors";

export interface CrudConfig {
  // Nome da tabela no banco
  table: string;
  // Colunas que o cliente PODE enviar ao criar/editar (whitelist de segurança).
  // O "id" nunca entra aqui porque é gerado pelo banco (SERIAL).
  columns: string[];
}

// Fábrica de rotas CRUD. Em vez de escrever 5 rotas para cada uma das 6 tabelas
// simples, geramos tudo a partir da configuração. As colunas são validadas
// contra a whitelist, então não há risco de SQL injection no nome dos campos.
export function createCrudRouter(config: CrudConfig): Router {
  const router = Router();
  const { table, columns } = config;

  // READ (todos)
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
      res.json(result.rows);
    } catch (err) {
      handleDbError(err, res);
    }
  });

  // READ (um)
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Registro não encontrado." });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      handleDbError(err, res);
    }
  });

  // CREATE
  router.post("/", async (req: Request, res: Response) => {
    try {
      const cols = columns.filter((c) => req.body[c] !== undefined);
      if (cols.length === 0) {
        res.status(400).json({ error: "Nenhum dado válido foi enviado." });
        return;
      }
      const values = cols.map((c) => normalize(req.body[c]));
      const placeholders = cols.map((_, i) => `$${i + 1}`);
      const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders.join(
        ", "
      )}) RETURNING *`;
      const result = await pool.query(sql, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleDbError(err, res);
    }
  });

  // UPDATE
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const cols = columns.filter((c) => req.body[c] !== undefined);
      if (cols.length === 0) {
        res.status(400).json({ error: "Nenhum dado válido foi enviado." });
        return;
      }
      const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
      const values = cols.map((c) => normalize(req.body[c]));
      values.push(req.params.id);
      const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${values.length} RETURNING *`;
      const result = await pool.query(sql, values);
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Registro não encontrado." });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      handleDbError(err, res);
    }
  });

  // DELETE
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [
        req.params.id,
      ]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Registro não encontrado." });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      handleDbError(err, res);
    }
  });

  return router;
}

// Converte strings vazias em null (pra disparar o NOT NULL do banco com
// mensagem clara) e mantém os demais valores como vieram.
function normalize(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}
