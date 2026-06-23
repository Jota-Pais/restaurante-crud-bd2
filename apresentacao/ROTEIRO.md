# 🎤 Apresentação — Sistema de Gestão de Restaurante (Tema 4)

Checklist do que mostrar, na ordem. Sem falas prontas: cada item é só **"mostra isso"**.

---

## ▶️ Antes de começar (deixar pronto)

- [ ] Banco PostgreSQL de pé: a base `restaurante` com as 8 tabelas, os dados **e a Parte 2**
  (views/procedures/triggers). O `npm run db:setup` já instala tudo (schema → seed → parte2).
- [ ] Na pasta do projeto, rodar **`npm run dev`** → sobe API + interface juntas.
- [ ] Deixar 3 abas abertas no navegador:
  - **App:** http://localhost:5173
  - **Swagger (APIs):** http://localhost:3001/api/docs
  - **pgAdmin** (ou o cliente do banco) já conectado na base `restaurante`.

---

## 1️⃣ BANCO — modelos e estrutura

Material em **`apresentacao/banco/`**. Mostrar nesta ordem:

- [ ] **`1-fluxo-conceitual.jpg`** — visão geral: como o dado flui no restaurante
  (Dados Mestres → Atendimento → Consumo → Encerramento). Serve de abertura.
- [ ] **`2-modelo-logico-er.jpg`** — modelo lógico (ER): as 8 tabelas, PK/FK e as
  cardinalidades **1 : N** entre elas.
- [ ] **`3-modelo-fisico-tipos.jpg`** — modelo físico: os tipos de cada coluna
  (`SERIAL`, `VARCHAR`, `NUMERIC`, `BOOLEAN`...) e as restrições (`NOT NULL`, `UNIQUE`, `FK`).
  *(`4-modelo-fisico-limpo.jpg` é a mesma coisa numa versão mais "limpa", use se preferir.)*
- [ ] **`schema.sql`** (ou abrir as tabelas no pgAdmin) — mostrar o **SQL real** das 8 tabelas:
  - `categorias`, `produtos`, `mesas`, `funcionarios`, `clientes`, `pedidos`, `itens_pedido`, `pagamentos`
  - Apontar as **regras de integridade** que aparecem no código e que vão reaparecer no app:
    - `CHECK (preco > 0)`, `CHECK (quantidade > 0)`, `CHECK (salario > 0)`
    - `UNIQUE` em `categorias.nome`, `mesas.numero`, `clientes.telefone`
    - `FOREIGN KEY` (produto→categoria, pedido→mesa/funcionário/cliente, item→pedido/produto)
    - `ON DELETE CASCADE` em `itens_pedido` (apagar o pedido apaga os itens)

### Parte 2 — Views, Procedures/Functions e Triggers

Abrir **`apresentacao/banco/parte2.sql`** (ou os objetos no pgAdmin) e mostrar que, além das
tabelas, o banco tem **relatórios e regras prontos**. Dá pra rodar ao vivo no pgAdmin:

- [ ] **3 Views** (consultas prontas):
  - `SELECT * FROM vw_vendas;` — pedidos com cliente, garçom e mesa.
  - `SELECT * FROM vw_produtos_mais_vendidos;` — ranking de produtos por quantidade vendida.
  - `SELECT * FROM vw_faturamento_funcionario;` — faturamento por funcionário (só pedidos fechados).
- [ ] **3 Procedures/Functions:**
  - `CALL fechar_pedido(2);` — procedure que fecha um pedido.
  - `SELECT faturamento_dia(CURRENT_DATE);` — function: faturamento do dia.
  - `SELECT total_pedidos_cliente(1);` — function: nº de pedidos de um cliente.
- [ ] **3 Triggers** (melhor mostrar o efeito pela aplicação, no bloco 3️⃣):
  - `trg_calcular_subtotal` — calcula o `subtotal` do item sozinho (quantidade × preço).
  - `trg_atualizar_total` — recalcula `pedidos.total` automaticamente a cada item.
  - `trg_status_mesa` — deixa a mesa **Ocupada** ao abrir o pedido e **Livre** ao fechar.

> Dica: a trigger `trg_atualizar_total` é o motivo de a API **não** somar o total manualmente —
> quem calcula é o banco. Bom gancho pra ligar Parte 2 → aplicação.

---

## 2️⃣ APIs — Swagger

- [ ] Abrir **http://localhost:3001/api/docs** — a doc interativa da API REST.
- [ ] Mostrar que cada tabela vira um conjunto de rotas REST (GET / POST / PUT / DELETE),
  agrupadas por **tag** (Pedidos, Produtos, Categorias, Mesas, Funcionários, Clientes, Pagamentos).
- [ ] Fazer **1 ou 2 chamadas ao vivo** com o botão **"Try it out" → Execute**:
  - **`GET /api/produtos`** → lista o cardápio (resposta vem do banco, status 200).
  - **`POST /api/pedidos`** → criar um pedido com itens (já vem com exemplo preenchido) →
    mostrar que volta o pedido criado com o **total** calculado (status 201).
- [ ] (Opcional) Mostrar um **erro tratado**: `POST /api/produtos` com `preco: 0` →
  a API devolve a mensagem do `CHECK` em português (status 400).

> A regra do banco (CHECK/UNIQUE/FK) é a mesma que o app usa — a API só traduz pra mensagem clara.

---

## 3️⃣ APLICAÇÃO — o app real

- [ ] Abrir **http://localhost:5173** ("Lucas na Chapa").
- [ ] **Pedidos** (tela principal, master-detail):
  - Criar um pedido novo: escolher mesa, garçom, cliente e **adicionar 2 itens**.
  - Mostrar o **total calculado** e que pedido + itens entram numa **única transação**.
  - **Triggers da Parte 2 ao vivo:** o `total` veio da trigger `trg_atualizar_total` (a API
    não soma nada). Abrir **Mesas** e mostrar que a mesa escolhida virou **Ocupada** (`trg_status_mesa`).
- [ ] **Validação** (as regras do banco virando mensagem na tela):
  - Tentar salvar um **produto com preço 0** → aparece a mensagem do `CHECK`.
  - Tentar criar uma **categoria com nome repetido** → bloqueio do `UNIQUE`.
- [ ] **Pagamentos:** fechar um pedido e registrar um pagamento (PIX / Cartão / Dinheiro).
  Ao fechar, a mesa volta a **Livre** sozinha (de novo a `trg_status_mesa`).
- [ ] **Chave estrangeira:** tentar **excluir uma categoria que tem produto** → mostrar o bloqueio da FK.
- [ ] Passar rápido pelos **cadastros de apoio** (Produtos, Mesas, Funcionários, Clientes) pra mostrar
  que o CRUD (criar / listar / editar / excluir) funciona em todas as tabelas.

---

## 🔗 Resumo da ligação banco → API → app

> A mesma regra está nos 3 lugares: o **banco** define (`CHECK`, `UNIQUE`, `FK` **e as triggers**),
> a **API** executa e traduz o erro, e o **app** mostra pro usuário.
> O melhor exemplo: o **total do pedido** e o **status da mesa** são calculados por **trigger** (Parte 2) —
> a API nem soma o total, confia no banco. É o fio que conecta os três blocos da apresentação.
