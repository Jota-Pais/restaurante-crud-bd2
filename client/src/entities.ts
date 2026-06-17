// Configuração de cada entidade simples (as 6 que usam o CRUD genérico).
// Definir os campos aqui evita escrever uma tela à mão para cada tabela:
// o componente EntityManager lê esta config e monta a tabela e o formulário.

export type FieldType = "text" | "number" | "money" | "textarea" | "checkbox" | "select";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // Para type "select" com opções fixas
  options?: { value: string; label: string }[];
  // Para type "select" que busca de outra entidade (chave estrangeira)
  fromEntity?: { entity: string; labelKey: string };
  // Não aparece no formulário (ex.: id, campos calculados)
  readOnly?: boolean;
  // Exibe o valor como um "badge" colorido na listagem (ex.: status da mesa).
  display?: "badge";
}

export interface EntityConfig {
  key: string; // rota da API e identificador
  singular: string;
  plural: string;
  fields: FieldConfig[];
}

export const entities: Record<string, EntityConfig> = {
  categorias: {
    key: "categorias",
    singular: "Categoria",
    plural: "Categorias",
    fields: [{ name: "nome", label: "Nome", type: "text", required: true }],
  },

  produtos: {
    key: "produtos",
    singular: "Produto",
    plural: "Produtos",
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true },
      { name: "descricao", label: "Descrição", type: "textarea" },
      { name: "preco", label: "Preço", type: "money", required: true },
      {
        name: "id_categoria",
        label: "Categoria",
        type: "select",
        required: true,
        fromEntity: { entity: "categorias", labelKey: "nome" },
      },
      { name: "ativo", label: "Ativo", type: "checkbox", display: "badge" },
    ],
  },

  mesas: {
    key: "mesas",
    singular: "Mesa",
    plural: "Mesas",
    fields: [
      { name: "numero", label: "Número", type: "number", required: true },
      { name: "capacidade", label: "Capacidade", type: "number", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        display: "badge",
        options: [
          { value: "Livre", label: "Livre" },
          { value: "Ocupada", label: "Ocupada" },
          { value: "Manutencao", label: "Manutenção" },
        ],
      },
    ],
  },

  funcionarios: {
    key: "funcionarios",
    singular: "Funcionário",
    plural: "Funcionários",
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true },
      { name: "cargo", label: "Cargo", type: "text", required: true },
      { name: "salario", label: "Salário", type: "money", required: true },
    ],
  },

  clientes: {
    key: "clientes",
    singular: "Cliente",
    plural: "Clientes",
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true },
      { name: "telefone", label: "Telefone", type: "text", required: true },
    ],
  },

  pagamentos: {
    key: "pagamentos",
    singular: "Pagamento",
    plural: "Pagamentos",
    fields: [
      {
        name: "id_pedido",
        label: "Pedido",
        type: "select",
        required: true,
        fromEntity: { entity: "pedidos", labelKey: "id" },
      },
      {
        name: "metodo_pagamento",
        label: "Método",
        type: "select",
        required: true,
        options: [
          { value: "PIX", label: "PIX" },
          { value: "Cartão de Crédito", label: "Cartão de Crédito" },
          { value: "Cartão de Débito", label: "Cartão de Débito" },
          { value: "Dinheiro", label: "Dinheiro" },
        ],
      },
      { name: "valor", label: "Valor", type: "money", required: true },
    ],
  },
};
