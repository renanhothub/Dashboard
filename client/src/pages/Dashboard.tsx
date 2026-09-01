import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { api } from "../api";
import { Card, Panel } from "../components/Card";
import type { Creator, MetricsSummary, Script, Video, VideoStatus } from "../types";

const STATUS_LABELS: Record<VideoStatus, string> = {
  roteiro: "Roteiro",
  gravacao: "Gravação",
  edicao: "Edição",
  revisao: "Revisão",
  publicado: "Publicado",
};

const COLORS = ["#7c3aed", "#a78bfa", "#f59e0b", "#38bdf8", "#22c55e"];

export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);

  useEffect(() => {
    api.videos.list().then(setVideos);
    api.creators.list().then(setCreators);
    api.scripts.list().then(setScripts);
    api.metrics.summary().then(setSummary);
  }, []);

  const publishedCount = videos.filter((v) => v.status === "publicado").length;
  const inProgressCount = videos.length - publishedCount;
  const topVideo = summary?.byVideo[0];

  const pipelineData = summary?.pipelineCounts.map((p) => ({ name: STATUS_LABELS[p.status], value: p.count })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Vídeos no pipeline" value={inProgressCount} sub="em produção agora" />
        <Card title="Vídeos publicados" value={publishedCount} />
        <Card title="Criadores ativos" value={creators.length} />
        <Card title="Scripts na biblioteca" value={scripts.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Distribuição do pipeline">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pipelineData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {pipelineData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Vídeo com melhor performance" action={<Link to="/metrics" className="text-xs text-brand-600 font-medium">ver todas →</Link>}>
          {topVideo ? (
            <div>
              <p className="font-semibold text-slate-800">{topVideo.title}</p>
              <p className="text-xs text-slate-500 mb-4">{topVideo.platform}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold">{topVideo.views.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-slate-500">views</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{topVideo.likes.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-slate-500">curtidas</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{topVideo.shares.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-slate-500">shares</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Ainda sem métricas registradas.</p>
          )}
        </Panel>
      </div>

      <Panel title="Últimos vídeos atualizados" action={<Link to="/pipeline" className="text-xs text-brand-600 font-medium">ver pipeline →</Link>}>
        <ul className="divide-y divide-slate-100">
          {videos.slice(0, 5).map((v) => (
            <li key={v.id} className="py-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{v.title}</span>
              <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{STATUS_LABELS[v.status]}</span>
            </li>
          ))}
          {videos.length === 0 && <li className="py-4 text-center text-slate-500 text-sm">Nenhum vídeo cadastrado ainda.</li>}
        </ul>
      </Panel>
    </div>
  );
}
