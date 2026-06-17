interface NavItem {
  key: string;
  label: string;
}

interface Props {
  items: NavItem[];
  active: string;
  onSelect: (key: string) => void;
}

export function Sidebar({ items, active, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">●</span>
        <div>
          <strong>Restaurante</strong>
          <span className="brand-sub">Gestão de Pedidos</span>
        </div>
      </div>
      <nav>
        {items.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? "active" : ""}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">Banco de Dados II · Tema 4</div>
    </aside>
  );
}
