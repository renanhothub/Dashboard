import type { Muscle } from "../types";
import { seatedF, standF } from "../scenes";

const seat = [
  { t: "box" as const, x: 98, y: 153, w: 44, h: 7 },
  { t: "box" as const, x: 104, y: 84, w: 32, h: 66 },
];
const seated = (open: number) => seatedF([15, 10], { at: [120, 148], leg: [90, 0], legScale: [open, 1] });

export const adutores: Muscle = {
  id: "adutores",
  name: "Adutores",
  tagline: "Parte interna da coxa",
  portions: [
    {
      id: "adutores",
      name: "Adutores",
      detail: "Adutor longo, curto e magno, pectíneo e grácil — aproximam as pernas e estabilizam quadril e joelho.",
      regions: ["adductors"],
      exercises: [
        {
          id: "cadeira-adutora",
          name: "Cadeira adutora",
          equipment: "Cadeira adutora",
          level: "Iniciante",
          sets: "4 x 12–15 · 60s",
          steps: [
            "Sente com as costas apoiadas e as almofadas na parte interna dos joelhos, pernas afastadas.",
            "Aproxime os joelhos até as almofadas quase se tocarem, contraindo a parte interna da coxa.",
            "Volte devagar até sentir o alongamento, sem deixar as placas encostarem.",
          ],
          tips: ["Comece com a abertura que for confortável e aumente aos poucos.", "Segure 1s com as pernas fechadas para contrair mais."],
          anim: {
            view: "front",
            props: seat,
            a: seated(0.62),
            b: seated(0.12),
            gear: [{ t: "legPad", at: "knee", side: "b" }],
            hl: ["adductors"],
          },
        },
        {
          id: "aducao-polia",
          name: "Adução de quadril na polia",
          equipment: "Polia baixa + tornozeleira",
          level: "Iniciante",
          sets: "3 x 12–15 cada lado · 45s",
          steps: [
            "De lado para a polia baixa, prenda a tornozeleira na perna mais próxima do aparelho.",
            "Afaste um pouco do aparelho e puxe a perna em direção à outra, cruzando levemente à frente.",
            "Retorne devagar até a perna voltar para o lado, sem inclinar o tronco.",
          ],
          tips: ["Segure no aparelho para manter o equilíbrio.", "Movimento controlado — a volta é tão importante quanto a ida."],
          anim: {
            view: "front",
            props: [{ t: "pulley", x: 182, y: 178 }],
            a: standF([12, 8], { leg: [30, 30] }),
            b: standF([12, 8], { leg: [-10, -10] }),
            gear: [{ t: "cable", from: [182, 178], to: "ankle" }],
            hl: ["adductors"],
          },
        },
        {
          id: "aducao-deitado",
          name: "Adução deitado de lado",
          equipment: "Colchonete (ou caneleira)",
          level: "Iniciante",
          sets: "3 x 15 cada lado · 45s",
          steps: [
            "Deite de lado apoiado no antebraço e cruze a perna de cima à frente, com o pé no chão.",
            "Com a perna de baixo estendida, eleve-a do chão o máximo que conseguir.",
            "Desça devagar sem encostar totalmente no chão e repita.",
          ],
          tips: ["Ponta do pé voltada para frente, não para cima.", "Para progredir, use uma caneleira."],
          anim: {
            view: "front",
            a: { at: [120, 176], torso: 90, leg: [270, 270], leg2: [100, 150], arm: [90, 90], arm2: [100, 80] },
            b: { at: [120, 176], torso: 90, leg: [252, 252], leg2: [100, 150], arm: [90, 90], arm2: [100, 80] },
            hl: ["adductors"],
          },
        },
      ],
    },
  ],
};
