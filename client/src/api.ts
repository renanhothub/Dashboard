import type { Creator, MetricsSummary, Script, Video, VideoStatus } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  creators: {
    list: () => request<Creator[]>("/creators"),
    create: (data: Partial<Creator>) => request<Creator>("/creators", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/creators/${id}`, { method: "DELETE" }),
  },
  scripts: {
    list: () => request<Script[]>("/scripts"),
    create: (data: Partial<Script>) => request<Script>("/scripts", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/scripts/${id}`, { method: "DELETE" }),
  },
  videos: {
    list: () => request<Video[]>("/videos"),
    create: (data: Partial<Video>) => request<Video>("/videos", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: number, status: VideoStatus) =>
      request<Video>(`/videos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    remove: (id: number) => request<void>(`/videos/${id}`, { method: "DELETE" }),
  },
  metrics: {
    summary: () => request<MetricsSummary>("/metrics/summary"),
    create: (data: { video_id: number; platform: string; views: number; likes: number; comments: number; shares: number }) =>
      request("/metrics", { method: "POST", body: JSON.stringify(data) }),
  },
};
