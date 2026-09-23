import { useCallback, useEffect, useState } from "react";

const KEY = "treino-pro:favoritos";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Favoritos salvos no próprio aparelho. */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>(read);
  useEffect(() => {
    const onStorage = () => setIds(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const toggle = useCallback((id: string) => {
    setIds((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* armazenamento indisponível: mantém só em memória */
      }
      return next;
    });
  }, []);
  return { ids, has: (id: string) => ids.includes(id), toggle };
}
