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

## Como rodar (passo a passo)

### 1. Pré-requisitos
- **Node.js 18+** e **npm**
- **PostgreSQL** rodando

### 2. Criar e popular o banco
No `psql` ou no pgAdmin, crie um banco e rode os dois scripts da pasta `database/`:

```sql
CREATE DATABASE restaurante;
-- conecte no banco "restaurante" e rode:
\i database/schema.sql
\i database/seed.sql
```

### 3. Configurar a conexão da API
```bash
cd server
cp .env.example .env
# edite o .env com o usuário/senha do seu PostgreSQL
```

### 4. Instalar dependências
Na raiz do projeto:
```bash
npm install              # instala o "concurrently"
npm run install:all      # instala server e client
```

### 5. Subir tudo (API + interface) com um comando só
Na raiz:
```bash
npm run dev
```

- API: http://localhost:3001
- Interface: **http://localhost:5173** ← abra esta no navegador

> Se quiser rodar separado: `npm run dev:api` em um terminal e `npm run dev:web` em outro.

---

## Estrutura do projeto

```
restaurante-crud/
├── database/
│   ├── schema.sql        # criação das 8 tabelas
│   └── seed.sql          # dados de exemplo
├── server/               # API REST (Node + Express + TS)
│   └── src/
│       ├── index.ts      # monta as rotas
│       ├── db.ts         # conexão com o PostgreSQL (pg)
│       ├── crud.ts       # fábrica de rotas CRUD (tabelas simples)
│       ├── errors.ts     # traduz erros do banco em PT-BR
│       └── routes/pedidos.ts  # pedido + itens (transação)
└── client/               # interface (React + Vite + TS)
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
```

```
