-- =====================================================================
-- Sistema de Gestão de Restaurante e Pedidos  (Tema 4)
-- Banco de Dados II - Projeto Final
-- Estrutura: 8 tabelas (mesma modelagem entregue na Parte 1)
-- =====================================================================

-- 1. Categorias do Cardápio
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Produtos (Cardápio)
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10,2) NOT NULL CHECK (preco > 0),
    id_categoria INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

-- 3. Mesas
CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    numero INT NOT NULL UNIQUE CHECK (numero > 0),
    capacidade INT NOT NULL CHECK (capacidade > 0),
    status VARCHAR(20) DEFAULT 'Livre' CHECK (status IN ('Livre', 'Ocupada', 'Manutencao'))
);

-- 4. Funcionários (Garçons, Caixas)
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    salario NUMERIC(10,2) NOT NULL CHECK (salario > 0)
);

-- 5. Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE
);

-- 6. Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    id_mesa INT NOT NULL,
    id_funcionario INT NOT NULL,
    id_cliente INT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Fechado', 'Cancelado')),
    total NUMERIC(10,2) DEFAULT 0 CHECK (total >= 0),
    FOREIGN KEY (id_mesa) REFERENCES mesas(id),
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

-- 7. Itens do Pedido
CREATE TABLE itens_pedido (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal > 0),
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id)
);

-- 8. Pagamentos
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL CHECK (metodo_pagamento IN ('PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro')),
    valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
);
