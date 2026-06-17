import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { Modal } from "./Modal";

type Row = Record<string, any>;
interface ItemForm {
  id_produto: number | "";
  quantidade: number;
}

export function PedidosView() {
  const [pedidos, setPedidos] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mesas, setMesas] = useState<Row[]>([]);
  const [funcionarios, setFuncionarios] = useState<Row[]>([]);
  const [clientes, setClientes] = useState<Row[]>([]);
  const [produtos, setProdutos] = useState<Row[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);

  // Formulário do novo pedido
  const [idMesa, setIdMesa] = useState<number | "">("");
  const [idFuncionario, setIdFuncionario] = useState<number | "">("");
  const [idCliente, setIdCliente] = useState<number | "">("");
  const [itens, setItens] = useState<ItemForm[]>([{ id_produto: "", quantidade: 1 }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, m, f, c, pr] = await Promise.all([
        api.list<Row>("pedidos"),
        api.list<Row>("mesas"),
        api.list<Row>("funcionarios"),
        api.list<Row>("clientes"),
        api.list<Row>("produtos"),
      ]);
      setPedidos(p);
      setMesas(m);
      setFuncionarios(f);
      setClientes(c);
      setProdutos(pr);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setIdMesa("");
    setIdFuncionario("");
    setIdCliente("");
    setItens([{ id_produto: "", quantidade: 1 }]);
    setFormError(null);
    setModalOpen(true);
  }

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setItens((arr) => arr.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItens((arr) => [...arr, { id_produto: "", quantidade: 1 }]);
  }

  function removeItem(index: number) {
    setItens((arr) => arr.filter((_, i) => i !== index));
  }

  const total = itens.reduce((sum, it) => {
    const prod = produtos.find((p) => p.id === it.id_produto);
    return sum + (prod ? Number(prod.preco) * it.quantidade : 0);
  }, 0);

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        id_mesa: idMesa,
        id_funcionario: idFuncionario,
        id_cliente: idCliente || null,
        itens: itens
          .filter((it) => it.id_produto !== "")
          .map((it) => {
            const prod = produtos.find((p) => p.id === it.id_produto)!;
            return {
              id_produto: it.id_produto,
              quantidade: it.quantidade,
              preco_unitario: Number(prod.preco),
            };
          }),
      };
      await api.create("pedidos", payload);
      setModalOpen(false);
      await load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(pedido: Row, status: string) {
    try {
      await api.update("pedidos", pedido.id, { status });
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleDelete(pedido: Row) {
    if (!confirm(`Excluir o pedido #${pedido.id} e seus itens?`)) return;
    try {
      await api.remove("pedidos", pedido.id);
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function openDetail(pedido: Row) {
    try {
      setDetail(await api.get<Row>("pedidos", pedido.id));
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Pedidos</h1>
          <p className="muted">{pedidos.length} pedido(s)</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Novo pedido
        </button>
      </header>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : pedidos.length === 0 ? (
        <div className="empty">Nenhum pedido aberto. Crie o primeiro pedido.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th>Mesa</th>
                <th>Garçom</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Total</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td className="col-id mono">{p.id}</td>
                  <td>Mesa {p.mesa_numero}</td>
                  <td>{p.funcionario_nome}</td>
                  <td>{p.cliente_nome ?? "—"}</td>
                  <td>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                  </td>
                  <td className="mono">{formatMoney(p.total)}</td>
                  <td className="col-actions">
                    <button className="link" onClick={() => openDetail(p)}>
                      Ver itens
                    </button>
                    {p.status === "Aberto" && (
                      <button className="link" onClick={() => changeStatus(p, "Fechado")}>
                        Fechar
                      </button>
                    )}
                    <button className="link danger" onClick={() => handleDelete(p)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de criação */}
      {modalOpen && (
        <Modal title="Novo pedido" onClose={() => setModalOpen(false)}>
          {formError && <div className="alert">{formError}</div>}
          <div className="form">
            <label className="field">
              <span className="field-label">
                Mesa<span className="req"> *</span>
              </span>
              <select value={idMesa} onChange={(e) => setIdMesa(Number(e.target.value) || "")}>
                <option value="">Selecione…</option>
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero} ({m.status})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">
                Garçom<span className="req"> *</span>
              </span>
              <select
                value={idFuncionario}
                onChange={(e) => setIdFuncionario(Number(e.target.value) || "")}
              >
                <option value="">Selecione…</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} — {f.cargo}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Cliente (opcional)</span>
              <select value={idCliente} onChange={(e) => setIdCliente(Number(e.target.value) || "")}>
                <option value="">Sem identificação</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="itens-section">
            <div className="itens-header">
              <h3>Itens do pedido</h3>
              <button className="btn-ghost sm" onClick={addItem}>
                + Adicionar item
              </button>
            </div>

            {itens.map((it, i) => {
              const prod = produtos.find((p) => p.id === it.id_produto);
              const subtotal = prod ? Number(prod.preco) * it.quantidade : 0;
              return (
                <div className="item-row" key={i}>
                  <select
                    value={it.id_produto}
                    onChange={(e) => updateItem(i, { id_produto: Number(e.target.value) || "" })}
                  >
                    <option value="">Produto…</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({formatMoney(p.preco)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={it.quantidade}
                    onChange={(e) => updateItem(i, { quantidade: Number(e.target.value) || 1 })}
                    className="qty"
                  />
                  <span className="subtotal mono">{formatMoney(subtotal)}</span>
                  {itens.length > 1 && (
                    <button className="icon-btn sm" onClick={() => removeItem(i)} aria-label="Remover">
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            <div className="total-row">
              <span>Total</span>
              <strong className="mono">{formatMoney(total)}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando…" : "Salvar pedido"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal de detalhe */}
      {detail && (
        <Modal title={`Pedido #${detail.id}`} onClose={() => setDetail(null)}>
          <div className="detail-grid">
            <div>
              <span className="muted">Status</span>
              <p>{detail.status}</p>
            </div>
            <div>
              <span className="muted">Total</span>
              <p className="mono">{formatMoney(detail.total)}</p>
            </div>
          </div>
          <table className="inner-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtde</th>
                <th>Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(detail.itens || []).map((it: Row) => (
                <tr key={it.id}>
                  <td>{it.produto_nome}</td>
                  <td className="mono">{it.quantidade}</td>
                  <td className="mono">{formatMoney(it.preco_unitario)}</td>
                  <td className="mono">{formatMoney(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}

function formatMoney(value: any): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
