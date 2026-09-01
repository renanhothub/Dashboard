import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Scripts from "./pages/Scripts";
import Creators from "./pages/Creators";
import Metrics from "./pages/Metrics";

const navItems = [
  { to: "/", label: "Visão geral", end: true },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/scripts", label: "Scripts & Hooks" },
  { to: "/creators", label: "Criadores" },
  { to: "/metrics", label: "Métricas" },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-700">UGC Dashboard</h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/metrics" element={<Metrics />} />
        </Routes>
      </main>
    </div>
  );
}
