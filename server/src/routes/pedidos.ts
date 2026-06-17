import { Router, Request, Response } from "express";
import { pool } from "../db";
import { handleDbError } from "../errors";

// Pedidos é o caso "master-detail": um pedido tem vários itens.
// Por isso ganha rotas próprias (não dá pra resolver com o CRUD genérico).
// A criação usa uma TRANSAÇÃO: ou grava o pedido e todos os itens, ou nada.
const router = Router();

// Lista pedidos já com os dados relacionados (mesa, garçom, cliente) e o
// total já pago (SUM dos pagamentos daquele pedido) — relação pedido 1──< pagamentos.
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             m.numero        AS mesa_numero,
             f.nome          AS funcionario_nome,
             c.nome          AS cliente_nome,
             COALESCE((
               SELECT SUM(pg.valor) FROM pagamentos pg WHERE pg.id_pedido = p.id
             ), 0)            AS total_pago
      FROM pedidos p
      JOIN mesas m         ON m.id = p.id_mesa
      JOIN funcionarios f  ON f.id = p.id_funcionario
      LEFT JOIN clientes c ON c.id = p.id_cliente
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    handleDbError(err, res);
  }
});

// Detalhe de um pedido com seus itens
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const pedido = await pool.query("SELECT * FROM pedidos WHERE id = $1", [req.params.id]);
    if (pedido.rows.length === 0) {
      res.status(404).json({ error: "Pedido não encontrado." });
      return;
    }
    const itens = await pool.query(
      `SELECT i.*, pr.nome AS produto_nome
       FROM itens_pedido i
       JOIN produtos pr ON pr.id = i.id_produto
       WHERE i.id_pedido = $1
       ORDER BY i.id`,
      [req.params.id]
    );
    // Pagamentos do pedido (relação pedido 1──< pagamentos)
    const pagamentos = await pool.query(
      "SELECT * FROM pagamentos WHERE id_pedido = $1 ORDER BY id",
      [req.params.id]
    );
    res.json({ ...pedido.rows[0], itens: itens.rows, pagamentos: pagamentos.rows });
  } catch (err) {
    handleDbError(err, res);
  }
});

// CREATE pedido + itens (transação)
router.post("/", async (req: Request, res: Response) => {
  const { id_mesa, id_funcionario, id_cliente, status, itens } = req.body as {
    id_mesa: number;
    id_funcionario: number;
    id_cliente: number | null;
    status?: string;
    itens: { id_produto: number; quantidade: number; preco_unitario: number }[];
  };

  if (!Array.isArray(itens) || itens.length === 0) {
    res.status(400).json({ error: "Adicione pelo menos um item ao pedido." });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pedidoRes = await client.query(
      `INSERT INTO pedidos (id_mesa, id_funcionario, id_cliente, status, total)
       VALUES ($1, $2, $3, $4, 0) RETURNING *`,
      [id_mesa, id_funcionario, id_cliente || null, status || "Aberto"]
    );
    const pedido = pedidoRes.rows[0];

    let total = 0;
    for (const item of itens) {
      const subtotal = Number(item.quantidade) * Number(item.preco_unitario);
      total += subtotal;
      await client.query(
        `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, item.id_produto, item.quantidade, item.preco_unitario, subtotal]
      );
    }

    // Atualiza o total do pedido com a soma dos subtotais.
    // OBS p/ integração com a Parte 2: se o grupo criar uma TRIGGER que já
    // calcula o total automaticamente, remova esta linha para não somar 2x.
    await client.query("UPDATE pedidos SET total = $1 WHERE id = $2", [total, pedido.id]);

    await client.query("COMMIT");
    res.status(201).json({ ...pedido, total });
  } catch (err) {
    await client.query("ROLLBACK");
    handleDbError(err, res);
  } finally {
    client.release();
  }
});

// UPDATE apenas o status do pedido (Aberto / Fechado / Cancelado)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *",
      [req.body.status, req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pedido não encontrado." });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
});

// DELETE pedido (os itens caem junto por causa do ON DELETE CASCADE)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Remove pagamentos vinculados primeiro (não têm cascade no schema)
    await pool.query("DELETE FROM pagamentos WHERE id_pedido = $1", [req.params.id]);
    const result = await pool.query("DELETE FROM pedidos WHERE id = $1 RETURNING *", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pedido não encontrado." });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    handleDbError(err, res);
  }
});

export default router;
