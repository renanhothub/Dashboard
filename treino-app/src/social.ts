import { api } from "./api";

export interface GroupSummary {
  id: number;
  name: string;
  code: string;
  ownerId: number;
  startsOn: string;
  endsOn: string | null;
  members: number;
  myPosition: number;
  myDays: number;
  leader: { name: string; days: number } | null;
}
export interface RankRow {
  id: number;
  name: string;
  days: number;
  last_day: string | null;
}
export interface Checkin {
  id: number;
  userId: number;
  userName: string;
  day: string;
  photo: string;
  caption: string | null;
  workout: string | null;
  createdAt: string;
  likes: number;
  liked: boolean;
}

export const listGroups = () => api<{ groups: GroupSummary[] }>("/groups").then((r) => r.groups);
export const getGroup = (id: number | string) => api<{ group: GroupSummary; ranking: RankRow[] }>(`/groups/${id}`);
export const createGroup = (name: string, startsOn: string, endsOn: string | null) =>
  api<{ group: GroupSummary }>("/groups", { body: { name, startsOn, endsOn } }).then((r) => r.group);
export const joinGroup = (code: string) => api<{ group: GroupSummary }>("/groups/join", { body: { code } }).then((r) => r.group);
export const leaveGroup = (id: number) => api(`/groups/${id}/leave`, { method: "POST" });
export const inviteInfo = (code: string) => api<{ name: string; owner: string }>(`/invites/${encodeURIComponent(code)}`);
export const groupFeed = (id: number | string, before?: number) =>
  api<{ checkins: Checkin[] }>(`/groups/${id}/feed${before ? `?before=${before}` : ""}`).then((r) => r.checkins);
export const myCheckins = () => api<{ checkins: Checkin[] }>("/checkins/mine").then((r) => r.checkins);
export const postCheckin = (body: { photo: string; caption: string; workout: string; day: string }) =>
  api<{ checkin: Checkin; countedToday: boolean }>("/checkins", { body });
export const deleteCheckin = (id: number) => api(`/checkins/${id}`, { method: "DELETE" });
export const likeCheckin = (id: number) => api<{ liked: boolean; likes: number }>(`/checkins/${id}/like`, { method: "POST" });

/** Link de convite que abre direto a tela de entrar na competição. */
export function inviteLink(code: string) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/convite/${code}`;
}

export async function shareInvite(g: { name: string; code: string }) {
  const url = inviteLink(g.code);
  const text = `Bora competir no Hot Training! Entre na competição "${g.name}" com o código ${g.code}:`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Hot Training", text, url });
      return "shared";
    } catch {
      /* cancelado */
    }
  }
  await navigator.clipboard?.writeText(`${text} ${url}`).catch(() => {});
  return "copied";
}

const PENDING = "treino-pro:convite";
export const setPendingInvite = (code: string | null) => {
  try {
    if (code) localStorage.setItem(PENDING, code);
    else localStorage.removeItem(PENDING);
  } catch {
    /* sem armazenamento */
  }
};
export const getPendingInvite = () => {
  try {
    return localStorage.getItem(PENDING);
  } catch {
    return null;
  }
};

export function fmtDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}
export function timeAgo(sqlDate: string) {
  const t = new Date(sqlDate.replace(" ", "T") + "Z").getTime();
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
const COLORS = ["#e8c35a", "#ff6b4a", "#5ac8e8", "#8be85a", "#c45ae8", "#e85a9b", "#5a7be8"];
export const avatarColor = (id: number) => COLORS[id % COLORS.length];
