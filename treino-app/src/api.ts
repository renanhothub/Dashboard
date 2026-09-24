/** Cliente da API do servidor Atlas do Treino. */

/** Endereço do servidor. Vazio = mesmo domínio do app (padrão em produção e no dev via proxy). */
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export interface User {
  id: number;
  name: string;
  email: string;
}

const TOKEN_KEY = "treino-pro:token";
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sem armazenamento */
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method: opts.method ?? (opts.body ? "POST" : "GET"),
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Sem conexão com o servidor. Verifique a internet.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Algo deu errado. Tente novamente.", res.status);
  return data as T;
}

/** URL completa de uma foto enviada. */
export const photoUrl = (p: string) => (p.startsWith("http") ? p : `${API_BASE}${p}`);

/** Reduz a foto no próprio celular antes de enviar (máx. 1080px, JPEG). */
export async function compressPhoto(file: File, max = 1080): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fail(new Error("Não foi possível ler a foto."));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Data local no formato AAAA-MM-DD (o "dia" do check-in é o dia do usuário, não o do servidor). */
export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
