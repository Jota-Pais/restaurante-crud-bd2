export interface NavItem {
  key: string;
  label: string;
  icon?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

interface Props {
  groups: NavGroup[];
  active: string;
  onSelect: (key: string) => void;
}

export function Sidebar({ groups, active, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">🍽️</span>
        <div>
          <strong>Restaurante</strong>
          <span className="brand-sub">Gestão de Pedidos</span>
        </div>
      </div>

      <nav>
        {groups.map((group) => (
          <div className="nav-group" key={group.title}>
            <span className="nav-group-title">{group.title}</span>
            {group.items.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${active === item.key ? "active" : ""}`}
                onClick={() => onSelect(item.key)}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">Banco de Dados II · Tema 4</div>
    </aside>
  );
}
