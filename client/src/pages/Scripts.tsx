import { useEffect, useState } from "react";
import { api } from "../api";
import type { Script } from "../types";

export default function Scripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", hook: "", body: "", category: "", tags: "", performance_note: "" });

  const load = () => api.scripts.list().then(setScripts);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.hook.trim()) return;
    await api.scripts.create(form);
    setForm({ title: "", hook: "", body: "", category: "", tags: "", performance_note: "" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await api.scripts.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Biblioteca de scripts & hooks</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          {showForm ? "Cancelar" : "+ Novo script"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Categoria (ex: unboxing, depoimento)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm md:col-span-2" placeholder="Hook (primeiros 3 segundos)" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} required />
          <textarea className="border border-slate-300 rounded-md px-3 py-2 text-sm md:col-span-2" placeholder="Roteiro completo" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Nota de performance" value={form.performance_note} onChange={(e) => setForm({ ...form, performance_note: e.target.value })} />
          <button type="submit" className="bg-slate-800 text-white text-sm font-medium rounded-md px-4 py-2 md:col-start-2 justify-self-end">
            Salvar script
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scripts.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-800">{s.title}</h3>
              <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-500 text-xs">
                remover
              </button>
            </div>
            {s.category && <span className="inline-block text-[10px] uppercase tracking-wide bg-brand-50 text-brand-700 rounded px-1.5 py-0.5 mt-1 w-fit">{s.category}</span>}
            <p className="text-sm text-slate-600 mt-2 italic">"{s.hook}"</p>
            {s.body && <p className="text-xs text-slate-500 mt-2 line-clamp-3">{s.body}</p>}
            {s.performance_note && <p className="text-xs text-emerald-600 mt-3">💡 {s.performance_note}</p>}
            {s.tags && (
              <div className="flex flex-wrap gap-1 mt-3">
                {s.tags.split(",").map((t) => (
                  <span key={t} className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">#{t.trim()}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {scripts.length === 0 && <p className="text-sm text-slate-500">Nenhum script cadastrado ainda.</p>}
      </div>
    </div>
  );
}
