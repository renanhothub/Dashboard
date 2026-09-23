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

/** Imagem enviada para o exercício (por número da lista, id ou nome), se existir. */
const imageById = new Map<string, string>();
allExercises.forEach(({ exercise }, i) => {
  const url = byNumber.get(i + 1) ?? bySlug.get(exercise.id) ?? bySlug.get(slug(exercise.name));
  if (url) imageById.set(exercise.id, url);
});

export const imageFor = (id: string) => imageById.get(id);
export const customImageCount = imageById.size;
