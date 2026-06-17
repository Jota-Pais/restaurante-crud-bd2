# 🍽️ CRUD — Sistema de Gestão de Restaurante e Pedidos

Projeto Final de **Banco de Dados II** · Tema 4
CRUD completo sobre o banco PostgreSQL modelado pelo grupo (8 tabelas).

**Stack:** Node + Express + TypeScript (API) · React + Vite + TypeScript (interface) · PostgreSQL.

---

## O que o sistema faz

CRUD (Create, Read, Update, Delete) sobre as 8 tabelas do banco:

- **Pedidos** — tela principal (master-detail): cria um pedido com vários itens em uma única transação, calcula o total, fecha e cancela pedidos.
- **Produtos, Categorias, Mesas, Funcionários, Clientes, Pagamentos** — cadastro completo com listagem, criação, edição e exclusão.

As regras de integridade do banco (`CHECK`, `UNIQUE`, `NOT NULL`, `FOREIGN KEY`) são traduzidas em mensagens claras na tela — atendendo às melhorias pedidas no slide 6 do trabalho (não gravar vazio, não aceitar preço/quantidade/salário ≤ 0, não criar pedido com cliente/produto inexistente, etc.).

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
│   └── seed.sql          # dados de exemplo (SQL puro)
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

## Integração com a Parte 2 (Views / Procedures / Functions / Triggers)

O CRUD foi feito pra conviver com a Parte 2 que o grupo está montando. Dois pontos de atenção:

- **Total do pedido:** hoje a API soma os subtotais e atualiza `pedidos.total`. Se o grupo criar uma **trigger** que já faz isso automaticamente, remova a linha indicada com um comentário em `server/src/routes/pedidos.ts` para não somar duas vezes.
- **Views/Procedures:** se quiserem listar dados a partir de uma `VIEW` (ex.: relatório de vendas) ou inserir via `PROCEDURE`, dá pra trocar o `SELECT`/`INSERT` direto dentro das rotas correspondentes.

---

## Roteiro sugerido para a apresentação (23/06)

1. Mostrar o banco já criado (8 tabelas) no pgAdmin.
2. Abrir a tela de **Produtos** → criar, editar e excluir um produto (CRUD completo).
3. Mostrar a **validação**: tentar salvar um produto com preço 0 → aparece a mensagem do `CHECK`.
4. Ir em **Pedidos** → criar um pedido novo com 2 itens → mostrar o total calculado e a transação.
5. Fechar o pedido e registrar um **Pagamento**.
6. Tentar excluir uma categoria que tem produto → mostrar o bloqueio da chave estrangeira.
