import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api";
import { Card, Panel } from "../components/Card";
import type { MetricsSummary } from "../types";

export default function Metrics() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);

  useEffect(() => {
    api.metrics.summary().then(setSummary);
  }, []);

  if (!summary) return <p className="text-sm text-slate-500">Carregando métricas...</p>;

  const { totals, byVideo, byPlatform } = summary;
  const engagementRate = totals.total_views > 0
    ? (((totals.total_likes + totals.total_comments + totals.total_shares) / totals.total_views) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Métricas de performance</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Views totais" value={totals.total_views.toLocaleString("pt-BR")} />
        <Card title="Curtidas" value={totals.total_likes.toLocaleString("pt-BR")} />
        <Card title="Comentários" value={totals.total_comments.toLocaleString("pt-BR")} />
        <Card title="Compartilhamentos" value={totals.total_shares.toLocaleString("pt-BR")} />
        <Card title="Taxa de engajamento" value={`${engagementRate}%`} />
      </div>

      <Panel title="Views por plataforma">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPlatform}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Vídeos publicados">
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-left">
            <tr>
              <th className="py-2 font-medium">Vídeo</th>
              <th className="py-2 font-medium">Plataforma</th>
              <th className="py-2 font-medium">Views</th>
              <th className="py-2 font-medium">Curtidas</th>
              <th className="py-2 font-medium">Comentários</th>
              <th className="py-2 font-medium">Compart.</th>
            </tr>
          </thead>
          <tbody>
            {byVideo.map((v) => (
              <tr key={v.video_id} className="border-t border-slate-100">
                <td className="py-2 font-medium text-slate-800">{v.title}</td>
                <td className="py-2 text-slate-500">{v.platform}</td>
                <td className="py-2">{v.views.toLocaleString("pt-BR")}</td>
                <td className="py-2">{v.likes.toLocaleString("pt-BR")}</td>
                <td className="py-2">{v.comments.toLocaleString("pt-BR")}</td>
                <td className="py-2">{v.shares.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {byVideo.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">Nenhum vídeo publicado com métricas ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
