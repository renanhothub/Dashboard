import { useEffect, useState } from "react";
import { api } from "../api";
import type { Creator } from "../types";

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", social_handle: "", rate_per_video: "" });

  const load = () => api.creators.list().then(setCreators);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await api.creators.create({ ...form, rate_per_video: form.rate_per_video ? Number(form.rate_per_video) : 0 });
    setForm({ name: "", email: "", phone: "", social_handle: "", rate_per_video: "" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await api.creators.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Criadores UGC</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          {showForm ? "Cancelar" : "+ Novo criador"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="@ redes sociais" value={form.social_handle} onChange={(e) => setForm({ ...form, social_handle: e.target.value })} />
          <input className="border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Valor por vídeo (R$)" type="number" value={form.rate_per_video} onChange={(e) => setForm({ ...form, rate_per_video: e.target.value })} />
          <button type="submit" className="bg-slate-800 text-white text-sm font-medium rounded-md px-4 py-2">
            Salvar criador
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Redes</th>
              <th className="px-4 py-3 font-medium">Valor/vídeo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-500">{c.email || c.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{c.social_handle || "—"}</td>
                <td className="px-4 py-3 text-slate-700">R$ {c.rate_per_video.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500 text-xs">
                    remover
                  </button>
                </td>
              </tr>
            ))}
            {creators.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Nenhum criador cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
