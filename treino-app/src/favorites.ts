import { toggleFavorite, useTraining } from "./training";

/** Favoritos (sincronizados com a conta junto com os treinos). */
export function useFavorites() {
  const { favorites } = useTraining();
  return { ids: favorites, has: (id: string) => favorites.includes(id), toggle: toggleFavorite };
}
