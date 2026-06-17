import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { EntityConfig, FieldConfig } from "../entities";
import { Modal } from "./Modal";

type Row = Record<string, any>;

interface Props {
  config: EntityConfig;
}

export function EntityManager({ config }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Opções carregadas para campos do tipo chave estrangeira
  const [fkOptions, setFkOptions] = useState<Record<string, Row[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await api.list<Row>(config.key));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [config.key]);

  // Carrega as opções das chaves estrangeiras (ex.: categorias do produto)
  const loadFkOptions = useCallback(async () => {
    const result: Record<string, Row[]> = {};
    for (const field of config.fields) {
      if (field.fromEntity) {
        try {
          result[field.name] = await api.list<Row>(field.fromEntity.entity);
        } catch {
          result[field.name] = [];
        }
      }
    }
    setFkOptions(result);
  }, [config]);

  useEffect(() => {
    load();
    loadFkOptions();
  }, [load, loadFkOptions]);

  function openCreate() {
    const initial: Row = {};
    config.fields.forEach((f) => {
      if (f.type === "checkbox") initial[f.name] = true;
    });
    setEditing(null);
    setForm(initial);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setForm({ ...row });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await api.update(config.key, editing.id, form);
      } else {
        await api.create(config.key, form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Row) {
    if (!confirm(`Excluir ${config.singular.toLowerCase()} #${row.id}?`)) return;
    try {
      await api.remove(config.key, row.id);
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  function renderCell(field: FieldConfig, row: Row) {
    const value = row[field.name];
    if (field.type === "checkbox") return value ? "Sim" : "Não";
    if (field.type === "money") return formatMoney(value);
    if (field.fromEntity) {
      const opt = (fkOptions[field.name] || []).find((o) => o.id === value);
      return opt ? opt[field.fromEntity.labelKey] : value;
    }
    return value ?? "—";
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{config.plural}</h1>
          <p className="muted">{rows.length} registro(s)</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Novo {config.singular.toLowerCase()}
        </button>
      </header>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Carregando…</p>
      ) : rows.length === 0 ? (
        <div className="empty">
          Nenhum registro ainda. Clique em “+ Novo {config.singular.toLowerCase()}” para começar.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-id">ID</th>
                {config.fields.map((f) => (
                  <th key={f.name}>{f.label}</th>
                ))}
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="col-id mono">{row.id}</td>
                  {config.fields.map((f) => (
                    <td key={f.name}>{renderCell(f, row)}</td>
                  ))}
                  <td className="col-actions">
                    <button className="link" onClick={() => openEdit(row)}>
                      Editar
                    </button>
                    <button className="link danger" onClick={() => handleDelete(row)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal
          title={`${editing ? "Editar" : "Novo"} ${config.singular.toLowerCase()}`}
          onClose={() => setModalOpen(false)}
        >
          {formError && <div className="alert">{formError}</div>}
          <div className="form">
            {config.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={form[field.name]}
                fkOptions={fkOptions[field.name] || []}
                onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({
  field,
  value,
  fkOptions,
  onChange,
}: {
  field: FieldConfig;
  value: any;
  fkOptions: Row[];
  onChange: (v: any) => void;
}) {
  const id = `field-${field.name}`;

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {field.label}
        {field.required && <span className="req"> *</span>}
      </span>

      {field.type === "textarea" ? (
        <textarea id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : field.type === "checkbox" ? (
        <input
          id={id}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="checkbox"
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(coerceSelect(e.target.value, field))}
        >
          <option value="">Selecione…</option>
          {field.options
            ? field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : fkOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {field.fromEntity ? `#${o.id} — ${o[field.fromEntity.labelKey]}` : o.id}
                </option>
              ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type === "number" || field.type === "money" ? "number" : "text"}
          step={field.type === "money" ? "0.01" : undefined}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              field.type === "number" || field.type === "money"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value
            )
          }
        />
      )}
    </label>
  );
}

function coerceSelect(value: string, field: FieldConfig) {
  if (value === "") return "";
  // Chave estrangeira → número; opções fixas → string
  return field.fromEntity ? Number(value) : value;
}

function formatMoney(value: any): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
