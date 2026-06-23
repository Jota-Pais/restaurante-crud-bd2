import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { createCrudRouter } from "./crud";
import { testConnection } from "./db";
import pedidosRouter from "./routes/pedidos";
import { swaggerSpec } from "./swagger";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Documentação interativa da API (Swagger UI) em http://localhost:3001/api/docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "API Restaurante — Docs" }));
// JSON cru da especificação OpenAPI (útil pra importar em outras ferramentas)
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

// --- Tabelas simples: resolvidas pelo CRUD genérico ---
app.use("/api/categorias", createCrudRouter({ table: "categorias", columns: ["nome"] }));

app.use(
  "/api/produtos",
  createCrudRouter({
    table: "produtos",
    columns: ["nome", "descricao", "preco", "id_categoria", "ativo"],
  })
);

app.use(
  "/api/mesas",
  createCrudRouter({ table: "mesas", columns: ["numero", "capacidade", "status"] })
);

app.use(
  "/api/funcionarios",
  createCrudRouter({ table: "funcionarios", columns: ["nome", "cargo", "salario"] })
);

app.use(
  "/api/clientes",
  createCrudRouter({ table: "clientes", columns: ["nome", "telefone"] })
);

app.use(
  "/api/pagamentos",
  createCrudRouter({
    table: "pagamentos",
    columns: ["id_pedido", "metodo_pagamento", "valor"],
  })
);

// --- Pedidos: master-detail com transação ---
app.use("/api/pedidos", pedidosRouter);

const PORT = process.env.PORT || 3001;

testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✓ API rodando em http://localhost:${PORT}`);
      console.log(`  Swagger UI: http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((err) => {
    console.error("✗ Não foi possível conectar ao PostgreSQL.");
    console.error("  Verifique o arquivo server/.env e se o banco está rodando.");
    console.error(err.message);
    process.exit(1);
  });
