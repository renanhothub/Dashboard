import { useEffect, useState } from "react";
import { api } from "../api";
import type { Creator, Script, Video, VideoStatus } from "../types";

const COLUMNS: { status: VideoStatus; label: string }[] = [
  { status: "roteiro", label: "Roteiro" },
  { status: "gravacao", label: "Gravação" },
  { status: "edicao", label: "Edição" },
  { status: "revisao", label: "Revisão" },
  { status: "publicado", label: "Publicado" },
];

const PLATFORMS = ["tiktok", "instagram", "youtube"];

export default function Pipeline() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", creator_id: "", script_id: "", platform: "tiktok" });

  const load = () => {
    api.videos.list().then(setVideos);
    api.creators.list().then(setCreators);
    api.scripts.list().then(setScripts);
  };

  useEffect(load, []);

  const moveVideo = async (id: number, status: VideoStatus) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    await api.videos.updateStatus(id, status);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.videos.create({
      title: form.title,
      creator_id: form.creator_id ? Number(form.creator_id) : null,
      script_id: form.script_id ? Number(form.script_id) : null,
      platform: form.platform,
    });
    setForm({ title: "", creator_id: "", script_id: "", platform: "tiktok" });
    setShowForm(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Pipeline de produção</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          {showForm ? "Cancelar" : "+ Novo vídeo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border border-slate-300 rounded-md px-3 py-2 text-sm md:col-span-2"
            placeholder="Título do vídeo"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={form.creator_id}
            onChange={(e) => setForm({ ...form, creator_id: e.target.value })}
          >
            <option value="">Criador (opcional)</option>
            {creators.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={form.script_id}
            onChange={(e) => setForm({ ...form, script_id: e.target.value })}
          >
            <option value="">Script (opcional)</option>
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <select
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button type="submit" className="bg-slate-800 text-white text-sm font-medium rounded-md px-4 py-2 md:col-start-4">
            Adicionar
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => draggingId !== null && moveVideo(draggingId, col.status)}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[300px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
                {videos.filter((v) => v.status === col.status).length}
              </span>
            </div>
            <div className="space-y-2">
              {videos
                .filter((v) => v.status === col.status)
                .map((v) => (
                  <div
                    key={v.id}
                    draggable
                    onDragStart={() => setDraggingId(v.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium text-slate-800">{v.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{v.creator_name ?? "sem criador"}</p>
                    <span className="inline-block text-[10px] uppercase tracking-wide bg-brand-50 text-brand-700 rounded px-1.5 py-0.5 mt-2">
                      {v.platform}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
