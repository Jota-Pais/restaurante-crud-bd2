# 🍽️ CRUD — Sistema de Gestão de Restaurante e Pedidos

Projeto Final de **Banco de Dados II** · Tema 4
CRUD completo sobre o banco PostgreSQL modelado pelo grupo (8 tabelas).

**Stack:** Node + Express + TypeScript (API) · React + Vite + TypeScript (interface) · PostgreSQL.

<!-- 📸 DEMONSTRAÇÃO — quando tiver prints/GIF da aplicação, crie a pasta docs/, salve as imagens lá e descomente:
## 📸 Demonstração

![Tela de Pedidos (master-detail)](docs/pedidos.png)
![Validação de regra do banco](docs/validacao.png)
-->

---

## O que o sistema faz

CRUD (Create, Read, Update, Delete) sobre as 8 tabelas do banco:

- **Pedidos** — tela principal (master-detail): cria um pedido com vários itens em uma única transação, calcula o total, fecha e cancela pedidos.
- **Produtos, Categorias, Mesas, Funcionários, Clientes, Pagamentos** — cadastro completo com listagem, criação, edição e exclusão.

As regras de integridade do banco (`CHECK`, `UNIQUE`, `NOT NULL`, `FOREIGN KEY`) são traduzidas em mensagens claras na tela (não gravar vazio, não aceitar preço/quantidade/salário ≤ 0, não criar pedido com cliente/produto inexistente, etc.).

---

## Como rodar

Há dois caminhos — **os dois deixam o sistema em http://localhost:5173.**

### ⚡ Caminho 1 — Docker (mais rápido, recomendado)

Só precisa ter o **Docker** instalado. Um comando sobe o banco (já com as 8 tabelas e os dados), a API e a interface:

```bash
git clone https://github.com/Jota-Pais/restaurante-crud-bd2
cd restaurante-crud-bd2
docker compose up
```

Abra **http://localhost:5173**. Só isso.

- Parar: `Ctrl+C`.
- Zerar o banco e recomeçar do zero: `docker compose down -v`.
- O PostgreSQL do container fica em `localhost:5433` (usuário/senha `postgres`) — útil pra inspecionar no pgAdmin.

### 🛠️ Caminho 2 — Local (pra quem já tem PostgreSQL + Node)

Pré-requisitos: **Node.js 18+** e **PostgreSQL** rodando.

```bash
cp server/.env.example server/.env   # ajuste a senha do seu PostgreSQL no .env
npm run setup                          # instala tudo + cria e popula o banco
npm run dev                            # sobe API + interface
```

Abra **http://localhost:5173**.

- `npm run setup` = instala as dependências (server + client) **e** cria/popula o banco `restaurante`.
- Só (re)criar o banco, sem reinstalar: `npm run db:setup` — é **idempotente** (pode rodar de novo sem dar erro de "já existe").
- Rodar API e interface separados: `npm run dev:api` e `npm run dev:web`.

> **Sobre os scripts SQL:** `database/schema.sql` e `database/seed.sql` são **SQL puro** (só os comandos), prontos pra anexar na entrega do portal. Tanto o `npm run db:setup` quanto o Docker apenas *leem* esses arquivos — a lógica de (re)criação fica fora deles.

---

## Estrutura do projeto

```
restaurante-crud/
├── docker-compose.yml    # sobe banco + API + interface (Caminho 1)
├── database/
│   ├── schema.sql        # criação das 8 tabelas (SQL puro)
│   ├── seed.sql          # dados de exemplo (SQL puro)
│   └── parte2.sql        # views, procedures/functions e triggers (SQL puro)
├── server/               # API REST (Node + Express + TS)
│   ├── Dockerfile
│   ├── scripts/
│   │   └── setup-db.js   # cria + popula o banco (npm run db:setup)
│   └── src/
│       ├── index.ts      # monta as rotas
│       ├── db.ts         # conexão com o PostgreSQL (pg)
│       ├── crud.ts       # fábrica de rotas CRUD (tabelas simples)
│       ├── errors.ts     # traduz erros do banco em PT-BR
│       └── routes/pedidos.ts  # pedido + itens (transação)
└── client/               # interface (React + Vite + TS)
    ├── Dockerfile
    └── src/
        ├── App.tsx
        ├── entities.ts            # config dos campos de cada tela
        └── components/
            ├── EntityManager.tsx  # CRUD genérico das tabelas simples
            └── PedidosView.tsx    # tela master-detail dos pedidos
```

---

## Parte 2 (Views / Procedures / Functions / Triggers) — já integrada

A Parte 2 do grupo está em **`database/parte2.sql`** e é instalada automaticamente pelo setup
(roda depois de `schema.sql` e `seed.sql`, tanto no `npm run db:setup` quanto no Docker). Contém:

- **3 views:** `vw_vendas`, `vw_produtos_mais_vendidos`, `vw_faturamento_funcionario`.
- **3 procedures/functions:** `fechar_pedido(...)`, `faturamento_dia(...)`, `total_pedidos_cliente(...)`.
- **3 triggers:** `trg_calcular_subtotal`, `trg_atualizar_total`, `trg_status_mesa`.

Ponto de integração com a API: como a trigger **`trg_atualizar_total`** já recalcula `pedidos.total`
a partir dos itens, a API **não** soma mais o total manualmente (a linha de `UPDATE pedidos SET total`
em `server/src/routes/pedidos.ts` foi removida). O banco é a fonte única do total.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.
