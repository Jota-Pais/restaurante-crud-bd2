-- =====================================================================
-- Parte 2 — Views, Procedures/Functions e Triggers  (Tema 4)
-- Banco de Dados II - Projeto Final
-- Rode DEPOIS de schema.sql e seed.sql.
-- Conteúdo: 3 views + 3 procedures/functions + 3 triggers (requisito mínimo).
-- =====================================================================


-- =============================== VIEWS ===============================

-- View 1: Vendas detalhadas (pedido com cliente, garçom e mesa)
CREATE VIEW vw_vendas AS
SELECT p.id AS pedido, c.nome AS cliente, c.telefone, f.nome AS funcionario,
       m.numero AS mesa, p.data_hora, p.status, p.total
FROM pedidos p
LEFT JOIN clientes c     ON c.id = p.id_cliente
JOIN funcionarios f      ON f.id = p.id_funcionario
JOIN mesas m             ON m.id = p.id_mesa;

-- View 2: Produtos mais vendidos
CREATE VIEW vw_produtos_mais_vendidos AS
SELECT p.nome, p.descricao, p.preco, c.nome AS categoria,
       SUM(ip.quantidade) AS total_vendido
FROM produtos p
JOIN categorias c        ON c.id = p.id_categoria
JOIN itens_pedido ip     ON ip.id_produto = p.id
GROUP BY p.nome, p.descricao, p.preco, categoria
ORDER BY total_vendido DESC;

-- View 3: Faturamento por funcionário (apenas pedidos fechados)
CREATE VIEW vw_faturamento_funcionario AS
SELECT f.nome, COUNT(p.id) AS qtd_pedidos, SUM(p.total) AS faturamento
FROM funcionarios f
LEFT JOIN pedidos p      ON f.id = p.id_funcionario
WHERE p.status = 'Fechado'
GROUP BY f.nome;


-- ====================== PROCEDURES / FUNCTIONS =======================

-- Procedure 1: Fecha um pedido (muda o status para 'Fechado')
CREATE OR REPLACE PROCEDURE fechar_pedido(p_idpedido INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE pedidos SET status = 'Fechado'
    WHERE id = p_idpedido;
END;
$$;

-- Function 2: Calcula o faturamento de um dia (pedidos fechados)
CREATE OR REPLACE FUNCTION faturamento_dia(data_consulta DATE)
RETURNS NUMERIC AS $$
DECLARE total_dia NUMERIC;
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO total_dia
    FROM pedidos p
    WHERE DATE(data_hora) = data_consulta AND status = 'Fechado';
    RETURN total_dia;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Retorna a quantidade de pedidos de um determinado cliente
CREATE OR REPLACE FUNCTION total_pedidos_cliente(clienteid INT)
RETURNS INT AS $$
DECLARE qtd INT;
BEGIN
    SELECT COUNT(*) INTO qtd
    FROM pedidos p
    WHERE id_cliente = clienteid;
    RETURN qtd;
END;
$$ LANGUAGE plpgsql;


-- ============================== TRIGGERS =============================

-- Trigger 1: Atualiza o total do pedido automaticamente a partir dos itens
CREATE OR REPLACE FUNCTION atualizar_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM itens_pedido
        WHERE id_pedido = COALESCE(NEW.id_pedido, OLD.id_pedido)
    )
    WHERE id = COALESCE(NEW.id_pedido, OLD.id_pedido);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_total
AFTER INSERT OR UPDATE OR DELETE
ON itens_pedido
FOR EACH ROW
EXECUTE FUNCTION atualizar_total_pedido();

-- Trigger 2: Altera o status da mesa automaticamente (Ocupada / Livre)
CREATE OR REPLACE FUNCTION controlar_status_mesa()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE mesas
        SET status = 'Ocupada'
        WHERE id = NEW.id_mesa;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status IN ('Fechado', 'Cancelado') THEN
            UPDATE mesas
            SET status = 'Livre'
            WHERE id = NEW.id_mesa;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_status_mesa
AFTER INSERT OR UPDATE
ON pedidos
FOR EACH ROW
EXECUTE FUNCTION controlar_status_mesa();

-- Trigger 3: Calcula o subtotal do item automaticamente (quantidade x preço)
CREATE OR REPLACE FUNCTION calcular_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.quantidade * NEW.preco_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_subtotal
BEFORE INSERT OR UPDATE
ON itens_pedido
FOR EACH ROW
EXECUTE FUNCTION calcular_subtotal();
