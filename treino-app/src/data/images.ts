import { allExercises } from "./index";

// Todas as imagens enviadas em src/assets/exercicios (detectadas no build).
const files = import.meta.glob("../assets/exercicios/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const byNumber = new Map<number, string>();
const bySlug = new Map<string, string>();
for (const [path, url] of Object.entries(files)) {
  const base = path.split("/").pop()!.replace(/\.[^.]+$/, "");
  const num = base.match(/^0*(\d{1,3})(?!\d)/);
  if (num) byNumber.set(Number(num[1]), url);
  const s = slug(base);
  bySlug.set(s, url);
  bySlug.set(s.replace(/^\d+-?/, ""), url);
}

/**
 * Imagem enviada para o exercício, se existir. Procura primeiro pelo nome do exercício no nome do
 * arquivo (ex.: "101_cadeira_adutora.webp"), depois pelo id e, por último, pelo número da lista.
 * Assim, incluir exercícios novos no meio da lista não desalinha as imagens.
 */
const imageById = new Map<string, string>();
allExercises.forEach(({ exercise }, i) => {
  const url = bySlug.get(slug(exercise.name)) ?? bySlug.get(exercise.id) ?? byNumber.get(i + 1);
  if (url) imageById.set(exercise.id, url);
});

export const imageFor = (id: string) => imageById.get(id);
export const customImageCount = imageById.size;
