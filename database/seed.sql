-- =====================================================================
-- Dados de exemplo para demonstração do CRUD
-- Rode DEPOIS do schema.sql
-- =====================================================================

INSERT INTO categorias (nome) VALUES
    ('Bebidas'),
    ('Pratos Principais'),
    ('Sobremesas'),
    ('Entradas');

INSERT INTO produtos (nome, descricao, preco, id_categoria) VALUES
    ('Coca-Cola 350ml', 'Lata gelada', 6.50, 1),
    ('Suco de Laranja 500ml', 'Natural, sem açúcar', 9.00, 1),
    ('Filé à Parmegiana', 'Acompanha arroz e fritas', 45.00, 2),
    ('Risoto de Camarão', 'Camarões frescos e parmesão', 58.00, 2),
    ('Pudim de Leite', 'Pudim caseiro', 12.00, 3),
    ('Petit Gateau', 'Com sorvete de creme', 18.00, 3),
    ('Bruschetta', 'Pão italiano, tomate e manjericão', 22.00, 4);

INSERT INTO mesas (numero, capacidade, status) VALUES
    (1, 4, 'Livre'),
    (2, 2, 'Ocupada'),
    (3, 6, 'Livre'),
    (4, 4, 'Manutencao');

INSERT INTO funcionarios (nome, cargo, salario) VALUES
    ('Carlos Silva', 'Garçom', 1800.00),
    ('Ana Souza', 'Caixa', 2200.00),
    ('Marina Costa', 'Garçonete', 1800.00);

INSERT INTO clientes (nome, telefone) VALUES
    ('Marcos Lima', '48999999999'),
    ('Beatriz Alves', '48988887777');

-- Pedido de exemplo (total será recalculado ao inserir os itens)
INSERT INTO pedidos (id_mesa, id_funcionario, id_cliente, status, total) VALUES
    (2, 1, 1, 'Aberto', 0);

INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal) VALUES
    (1, 3, 1, 45.00, 45.00),
    (1, 1, 2, 6.50, 13.00);

-- Ajusta o total do pedido conforme os itens inseridos
UPDATE pedidos SET total = (
    SELECT COALESCE(SUM(subtotal), 0) FROM itens_pedido WHERE id_pedido = pedidos.id
) WHERE id = 1;

INSERT INTO pagamentos (id_pedido, metodo_pagamento, valor) VALUES
    (1, 'PIX', 58.00);
