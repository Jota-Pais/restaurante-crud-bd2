import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { EntityManager } from "./components/EntityManager";
import { PedidosView } from "./components/PedidosView";
import { entities } from "./entities";

const NAV = [
  { key: "pedidos", label: "Pedidos" },
  { key: "produtos", label: "Produtos" },
  { key: "categorias", label: "Categorias" },
  { key: "mesas", label: "Mesas" },
  { key: "funcionarios", label: "Funcionários" },
  { key: "clientes", label: "Clientes" },
  { key: "pagamentos", label: "Pagamentos" },
];

export default function App() {
  const [active, setActive] = useState("pedidos");

  return (
    <div className="layout">
      <Sidebar items={NAV} active={active} onSelect={setActive} />
      <main className="content">
        {active === "pedidos" ? (
          <PedidosView />
        ) : (
          <EntityManager key={active} config={entities[active]} />
        )}
      </main>
    </div>
  );
}
