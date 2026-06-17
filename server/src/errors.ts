import { Response } from "express";

// Traduz os erros do PostgreSQL para mensagens claras em português.
// É aqui que as regras de integridade do banco (CHECK, UNIQUE, FK, NOT NULL)
// viram mensagens amigáveis na tela — atendendo às melhorias do slide 6:
// não gravar vazio, não aceitar valores inválidos, não permitir preço/qtde
// zero ou negativo, não criar pedido com cliente/produto inexistente, etc.
export function handleDbError(err: unknown, res: Response): void {
  const e = err as { code?: string; constraint?: string; column?: string; detail?: string };

  switch (e.code) {
    case "23502": // not_null_violation
      res.status(400).json({
        error: `O campo "${e.column ?? "obrigatório"}" não pode ficar vazio.`,
      });
      return;

    case "23505": // unique_violation
      res.status(409).json({
        error: "Já existe um registro com esse valor (campo único duplicado).",
      });
      return;

    case "23503": // foreign_key_violation
      res.status(400).json({
        error:
          "Referência inválida: o registro relacionado não existe ou ainda está em uso por outro registro.",
      });
      return;

    case "23514": // check_violation
      res.status(400).json({
        error:
          "Valor inválido. Verifique as regras do campo (ex.: preço, quantidade e salário precisam ser maiores que zero).",
      });
      return;

    default:
      console.error("Erro inesperado no banco:", err);
      res.status(500).json({ error: "Erro interno ao acessar o banco de dados." });
  }
}
