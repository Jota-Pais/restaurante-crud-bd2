// Especificação OpenAPI (Swagger) da API do restaurante.
// Serve para DEMONSTRAR as rotas na apresentação: o Swagger UI em
// http://localhost:3001/api/docs lê este objeto e monta a página interativa
// com o botão "Try it out" para testar cada endpoint ao vivo.

// Respostas de erro reaproveitadas (as mensagens vêm de errors.ts)
const erro = (descricao: string) => ({
  description: descricao,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Erro" },
    },
  },
});

// Gera os 5 caminhos CRUD de uma tabela simples (lista, cria, detalha, edita, exclui).
// Evita repetir o mesmo bloco para cada uma das 6 entidades.
function crudPaths(opts: {
  recurso: string; // ex.: "produtos"
  tag: string; // ex.: "Produtos"
  schema: string; // ex.: "Produto"
  inputSchema: string; // ex.: "ProdutoInput"
}) {
  const { recurso, tag, schema, inputSchema } = opts;
  const base = `/api/${recurso}`;
  return {
    [base]: {
      get: {
        tags: [tag],
        summary: `Lista todos os registros de ${recurso}`,
        responses: {
          "200": {
            description: "Lista de registros",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: `#/components/schemas/${schema}` } },
              },
            },
          },
        },
      },
      post: {
        tags: [tag],
        summary: `Cria um novo registro em ${recurso}`,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: `#/components/schemas/${inputSchema}` } },
          },
        },
        responses: {
          "201": {
            description: "Registro criado",
            content: {
              "application/json": { schema: { $ref: `#/components/schemas/${schema}` } },
            },
          },
          "400": erro("Dados inválidos (campo vazio, valor fora da regra, etc.)"),
          "409": erro("Valor único duplicado"),
        },
      },
    },
    [`${base}/{id}`]: {
      get: {
        tags: [tag],
        summary: `Busca um registro de ${recurso} pelo id`,
        parameters: [idParam],
        responses: {
          "200": {
            description: "Registro encontrado",
            content: {
              "application/json": { schema: { $ref: `#/components/schemas/${schema}` } },
            },
          },
          "404": erro("Registro não encontrado"),
        },
      },
      put: {
        tags: [tag],
        summary: `Atualiza um registro de ${recurso}`,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: `#/components/schemas/${inputSchema}` } },
          },
        },
        responses: {
          "200": {
            description: "Registro atualizado",
            content: {
              "application/json": { schema: { $ref: `#/components/schemas/${schema}` } },
            },
          },
          "400": erro("Dados inválidos"),
          "404": erro("Registro não encontrado"),
          "409": erro("Valor único duplicado"),
        },
      },
      delete: {
        tags: [tag],
        summary: `Exclui um registro de ${recurso}`,
        parameters: [idParam],
        responses: {
          "200": {
            description: "Registro excluído",
            content: {
              "application/json": {
                schema: { type: "object", properties: { ok: { type: "boolean", example: true } } },
              },
            },
          },
          "400": erro("Registro está em uso por outro (chave estrangeira)"),
          "404": erro("Registro não encontrado"),
        },
      },
    },
  };
}

const idParam = {
  name: "id",
  in: "path",
  required: true,
  description: "Identificador do registro",
  schema: { type: "integer" },
  example: 1,
};

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API — Sistema de Gestão de Restaurante",
    version: "1.0.0",
    description:
      "CRUD do Projeto Final de Banco de Dados II (Tema 4). API REST em Node + Express + " +
      "TypeScript sobre PostgreSQL (8 tabelas). Use o botão **Try it out** para testar cada rota.",
  },
  servers: [{ url: "http://localhost:3001", description: "Servidor local (npm run dev)" }],
  tags: [
    { name: "Pedidos", description: "Pedido + itens (transação) — caso master-detail" },
    { name: "Produtos", description: "Cardápio" },
    { name: "Categorias", description: "Categorias do cardápio" },
    { name: "Mesas", description: "Mesas do salão" },
    { name: "Funcionários", description: "Equipe" },
    { name: "Clientes", description: "Clientes" },
    { name: "Pagamentos", description: "Pagamentos de um pedido" },
  ],
  paths: {
    // --- Pedidos: master-detail com transação (rotas próprias) ---
    "/api/pedidos": {
      get: {
        tags: ["Pedidos"],
        summary: "Lista os pedidos com mesa, garçom, cliente e total já pago",
        responses: {
          "200": {
            description: "Lista de pedidos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/PedidoListado" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Pedidos"],
        summary: "Cria um pedido com vários itens em uma única transação",
        description:
          "Grava o pedido e todos os itens dentro de um BEGIN/COMMIT. Se qualquer item " +
          "violar uma regra do banco, faz ROLLBACK e nada é gravado. O total é a soma dos subtotais.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PedidoInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Pedido criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Pedido" } },
            },
          },
          "400": erro("Pedido sem itens ou com dados inválidos"),
        },
      },
    },
    "/api/pedidos/{id}": {
      get: {
        tags: ["Pedidos"],
        summary: "Detalha um pedido com seus itens e pagamentos",
        parameters: [idParam],
        responses: {
          "200": {
            description: "Pedido com itens e pagamentos",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PedidoDetalhado" } },
            },
          },
          "404": erro("Pedido não encontrado"),
        },
      },
      put: {
        tags: ["Pedidos"],
        summary: "Altera o status do pedido (Aberto / Fechado / Cancelado)",
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["Aberto", "Fechado", "Cancelado"],
                    example: "Fechado",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Pedido atualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Pedido" } } },
          },
          "404": erro("Pedido não encontrado"),
        },
      },
      delete: {
        tags: ["Pedidos"],
        summary: "Exclui o pedido (os itens caem junto por ON DELETE CASCADE)",
        parameters: [idParam],
        responses: {
          "200": {
            description: "Pedido excluído",
            content: {
              "application/json": {
                schema: { type: "object", properties: { ok: { type: "boolean", example: true } } },
              },
            },
          },
          "404": erro("Pedido não encontrado"),
        },
      },
    },

    // --- Tabelas simples (CRUD genérico) ---
    ...crudPaths({ recurso: "produtos", tag: "Produtos", schema: "Produto", inputSchema: "ProdutoInput" }),
    ...crudPaths({ recurso: "categorias", tag: "Categorias", schema: "Categoria", inputSchema: "CategoriaInput" }),
    ...crudPaths({ recurso: "mesas", tag: "Mesas", schema: "Mesa", inputSchema: "MesaInput" }),
    ...crudPaths({ recurso: "funcionarios", tag: "Funcionários", schema: "Funcionario", inputSchema: "FuncionarioInput" }),
    ...crudPaths({ recurso: "clientes", tag: "Clientes", schema: "Cliente", inputSchema: "ClienteInput" }),
    ...crudPaths({ recurso: "pagamentos", tag: "Pagamentos", schema: "Pagamento", inputSchema: "PagamentoInput" }),
  },
  components: {
    schemas: {
      Erro: {
        type: "object",
        properties: {
          error: { type: "string", example: 'O campo "nome" não pode ficar vazio.' },
        },
      },

      // Categorias
      Categoria: {
        type: "object",
        properties: { id: { type: "integer", example: 1 }, nome: { type: "string", example: "Xis" } },
      },
      CategoriaInput: {
        type: "object",
        required: ["nome"],
        properties: { nome: { type: "string", example: "Sobremesas" } },
      },

      // Produtos
      Produto: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nome: { type: "string", example: "Xis Salada" },
          descricao: { type: "string", example: "Hambúrguer, queijo, alface, tomate e maionese" },
          preco: { type: "number", format: "float", example: 24.0 },
          id_categoria: { type: "integer", example: 1 },
          ativo: { type: "boolean", example: true },
        },
      },
      ProdutoInput: {
        type: "object",
        required: ["nome", "preco", "id_categoria"],
        properties: {
          nome: { type: "string", example: "Xis Bacon" },
          descricao: { type: "string", example: "Hambúrguer, bacon, queijo e salada" },
          preco: { type: "number", format: "float", example: 28.0 },
          id_categoria: { type: "integer", example: 1 },
          ativo: { type: "boolean", example: true },
        },
      },

      // Mesas
      Mesa: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          numero: { type: "integer", example: 1 },
          capacidade: { type: "integer", example: 4 },
          status: { type: "string", enum: ["Livre", "Ocupada", "Manutencao"], example: "Livre" },
        },
      },
      MesaInput: {
        type: "object",
        required: ["numero", "capacidade"],
        properties: {
          numero: { type: "integer", example: 6 },
          capacidade: { type: "integer", example: 4 },
          status: { type: "string", enum: ["Livre", "Ocupada", "Manutencao"], example: "Livre" },
        },
      },

      // Funcionários
      Funcionario: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nome: { type: "string", example: "Lucas Fernandes Rovaris" },
          cargo: { type: "string", example: "Chapeiro" },
          salario: { type: "number", format: "float", example: 2600.0 },
        },
      },
      FuncionarioInput: {
        type: "object",
        required: ["nome", "cargo", "salario"],
        properties: {
          nome: { type: "string", example: "Novo Funcionário" },
          cargo: { type: "string", example: "Garçom" },
          salario: { type: "number", format: "float", example: 1900.0 },
        },
      },

      // Clientes
      Cliente: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nome: { type: "string", example: "Marcos Lima" },
          telefone: { type: "string", example: "48999990001" },
        },
      },
      ClienteInput: {
        type: "object",
        required: ["nome", "telefone"],
        properties: {
          nome: { type: "string", example: "Cliente Novo" },
          telefone: { type: "string", example: "48999990004" },
        },
      },

      // Pagamentos
      Pagamento: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          id_pedido: { type: "integer", example: 1 },
          metodo_pagamento: {
            type: "string",
            enum: ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"],
            example: "Cartão de Crédito",
          },
          valor: { type: "number", format: "float", example: 68.0 },
          data_hora: { type: "string", format: "date-time" },
        },
      },
      PagamentoInput: {
        type: "object",
        required: ["id_pedido", "metodo_pagamento", "valor"],
        properties: {
          id_pedido: { type: "integer", example: 2 },
          metodo_pagamento: {
            type: "string",
            enum: ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro"],
            example: "PIX",
          },
          valor: { type: "number", format: "float", example: 70.0 },
        },
      },

      // Pedidos
      Pedido: {
        type: "object",
        properties: {
          id: { type: "integer", example: 3 },
          id_mesa: { type: "integer", example: 1 },
          id_funcionario: { type: "integer", example: 1 },
          id_cliente: { type: "integer", nullable: true, example: 1 },
          data_hora: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["Aberto", "Fechado", "Cancelado"], example: "Aberto" },
          total: { type: "number", format: "float", example: 50.0 },
        },
      },
      PedidoListado: {
        allOf: [
          { $ref: "#/components/schemas/Pedido" },
          {
            type: "object",
            properties: {
              mesa_numero: { type: "integer", example: 1 },
              funcionario_nome: { type: "string", example: "Lucas Fernandes Rovaris" },
              cliente_nome: { type: "string", nullable: true, example: "Marcos Lima" },
              total_pago: { type: "number", format: "float", example: 0.0 },
            },
          },
        ],
      },
      PedidoDetalhado: {
        allOf: [
          { $ref: "#/components/schemas/Pedido" },
          {
            type: "object",
            properties: {
              itens: { type: "array", items: { $ref: "#/components/schemas/ItemPedido" } },
              pagamentos: { type: "array", items: { $ref: "#/components/schemas/Pagamento" } },
            },
          },
        ],
      },
      PedidoInput: {
        type: "object",
        required: ["id_mesa", "id_funcionario", "itens"],
        properties: {
          id_mesa: { type: "integer", example: 1 },
          id_funcionario: { type: "integer", example: 1 },
          id_cliente: { type: "integer", nullable: true, example: 1 },
          status: { type: "string", enum: ["Aberto", "Fechado", "Cancelado"], example: "Aberto" },
          itens: {
            type: "array",
            items: { $ref: "#/components/schemas/ItemPedidoInput" },
            example: [
              { id_produto: 1, quantidade: 2, preco_unitario: 24.0 },
              { id_produto: 10, quantidade: 2, preco_unitario: 7.0 },
            ],
          },
        },
      },
      ItemPedido: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          id_pedido: { type: "integer", example: 1 },
          id_produto: { type: "integer", example: 1 },
          quantidade: { type: "integer", example: 2 },
          preco_unitario: { type: "number", format: "float", example: 24.0 },
          subtotal: { type: "number", format: "float", example: 48.0 },
        },
      },
      ItemPedidoInput: {
        type: "object",
        required: ["id_produto", "quantidade", "preco_unitario"],
        properties: {
          id_produto: { type: "integer", example: 1 },
          quantidade: { type: "integer", example: 2 },
          preco_unitario: { type: "number", format: "float", example: 24.0 },
        },
      },
    },
  },
};
