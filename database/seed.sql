-- =====================================================================
-- Dados de exemplo para demonstração do CRUD
-- Tema: "Lucas na Chapa" — lancheria de xis, porções e bebidas
-- Rode DEPOIS do schema.sql
-- =====================================================================

INSERT INTO categorias (nome) VALUES
    ('Xis'),
    ('Porções'),
    ('Bebidas'),
    ('Sobremesas');

INSERT INTO produtos (nome, descricao, preco, id_categoria) VALUES
    ('Xis Salada', 'Hambúrguer, queijo, alface, tomate e maionese', 24.00, 1),
    ('Xis Bacon', 'Hambúrguer, bacon, queijo e salada', 28.00, 1),
    ('Xis Calabresa', 'Calabresa, queijo, salada e maionese', 27.00, 1),
    ('Xis Frango', 'Frango desfiado, catupiry e salada', 29.00, 1),
    ('Xis Egg', 'Hambúrguer, ovo, queijo e salada', 25.00, 1),
    ('Xis Tudo', 'Dois hambúrgueres, bacon, calabresa, ovo, queijo e salada', 36.00, 1),
    ('Batata Frita', 'Porção de batata frita crocante', 18.00, 2),
    ('Batata com Cheddar e Bacon', 'Batata frita coberta com cheddar e bacon', 28.00, 2),
    ('Polenta Frita', 'Porção de polenta frita', 16.00, 2),
    ('Coca-Cola Lata 350ml', 'Lata gelada', 7.00, 3),
    ('Guaraná Antarctica Lata 350ml', 'Lata gelada', 7.00, 3),
    ('Suco de Laranja 500ml', 'Natural, sem açúcar', 10.00, 3),
    ('Água Mineral 500ml', 'Com ou sem gás', 5.00, 3),
    ('Milkshake de Chocolate 400ml', 'Cremoso, com calda', 17.00, 4),
    ('Pudim de Leite', 'Fatia caseira', 12.00, 4);

INSERT INTO mesas (numero, capacidade, status) VALUES
    (1, 4, 'Livre'),
    (2, 2, 'Ocupada'),
    (3, 6, 'Livre'),
    (4, 4, 'Manutencao'),
    (5, 2, 'Ocupada');

INSERT INTO funcionarios (nome, cargo, salario) VALUES
    ('Lucas Mendes', 'Chapeiro', 2600.00),
    ('Bruna Rocha', 'Atendente', 1900.00),
    ('Diego Fernandes', 'Garçom', 1850.00),
    ('Carla Souza', 'Caixa', 2100.00);

INSERT INTO clientes (nome, telefone) VALUES
    ('Marcos Lima', '48999990001'),
    ('Beatriz Alves', '48999990002'),
    ('Rafael Nunes', '48999990003');

-- Dois pedidos de exemplo (o total é recalculado a partir dos itens):
--   #1 já fechado e pago   #2 ainda em aberto (bom pra demonstrar pagamentos)
INSERT INTO pedidos (id_mesa, id_funcionario, id_cliente, status, total) VALUES
    (2, 1, 1, 'Fechado', 0),
    (5, 3, 2, 'Aberto', 0);

INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal) VALUES
    (1, 6, 1, 36.00, 36.00),   -- Xis Tudo
    (1, 7, 1, 18.00, 18.00),   -- Batata Frita
    (1, 10, 2, 7.00, 14.00),   -- Coca-Cola x2
    (2, 2, 2, 28.00, 56.00),   -- Xis Bacon x2
    (2, 11, 2, 7.00, 14.00);   -- Guaraná x2

-- Ajusta o total de cada pedido conforme os itens inseridos
UPDATE pedidos SET total = (
    SELECT COALESCE(SUM(subtotal), 0) FROM itens_pedido WHERE id_pedido = pedidos.id
) WHERE id IN (1, 2);

-- Pedido #1 já está totalmente pago; o #2 fica sem pagamento de propósito
INSERT INTO pagamentos (id_pedido, metodo_pagamento, valor) VALUES
    (1, 'Cartão de Crédito', 68.00);
