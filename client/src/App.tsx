import { useState } from "react";
import { Sidebar, NavGroup } from "./components/Sidebar";
import { EntityManager } from "./components/EntityManager";
import { PedidosView } from "./components/PedidosView";
import { FeedbackHost } from "./components/feedback";
import { entities } from "./entities";

// Menu agrupado: separa o dia a dia (Operação) dos cadastros de apoio.
const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operação",
    items: [
      { key: "pedidos", label: "Pedidos", icon: "🧾" },
      { key: "pagamentos", label: "Pagamentos", icon: "💳" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { key: "produtos", label: "Produtos", icon: "🍽️" },
      { key: "categorias", label: "Categorias", icon: "🏷️" },
      { key: "mesas", label: "Mesas", icon: "🪑" },
      { key: "funcionarios", label: "Funcionários", icon: "🧑‍🍳" },
      { key: "clientes", label: "Clientes", icon: "👥" },
    ],
  },
];

export default function App() {
  const [active, setActive] = useState("pedidos");

  return (
    <div className="layout">
      <Sidebar groups={NAV_GROUPS} active={active} onSelect={setActive} />
      <main className="content">
        {active === "pedidos" ? (
          <PedidosView />
        ) : (
          <EntityManager key={active} config={entities[active]} />
        )}
      </main>
      <FeedbackHost />
    </div>
  );
}
