// Gera o e-book completo e a amostra grátis em PDF.
// Uso: node produto/gerar-pdf.mjs   (requer python3 + Pillow e Playwright)
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }

const aqui = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(aqui);
const build = path.join(aqui, 'build');
const { exercicios, planos } = await import(pathToFileURL(path.join(aqui, 'exercicios.mjs')).href);

// Converte os PNGs da raiz em JPEGs leves (em produto/build/img, ignorado pelo git)
mkdirSync(path.join(build, 'img'), { recursive: true });
execFileSync('python3', ['-c', `
import glob, os
from PIL import Image
for p in sorted(glob.glob(os.path.join(${JSON.stringify(repo)}, '[0-9][0-9][0-9]_*.png'))):
    d = os.path.join(${JSON.stringify(build)}, 'img', os.path.basename(p)[:3] + '.jpg')
    if not os.path.exists(d):
        im = Image.open(p).convert('RGB'); im.thumbnail((1400, 1400))
        im.save(d, 'JPEG', quality=80, optimize=True, progressive=True)
`], { stdio: 'inherit' });

const TITULO = 'Guia Ilustrado de Musculação';
const SUB = '103 exercícios com execução passo a passo, dicas, erros comuns e planos de treino prontos';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = (n) => String(n).padStart(3, '0');
const porId = new Map(exercicios.map((e) => [e[0], e]));

// Grupos na ordem em que aparecem
const grupos = [];
for (const e of exercicios) {
  let g = grupos.find((x) => x.nome === e[2]);
  if (!g) grupos.push((g = { nome: e[2], itens: [] }));
  g.itens.push(e);
}

const capa = `
<section class="pagina capa">
  <div class="capa-topo">MUSCULAÇÃO · GUIA PRÁTICO</div>
  <div class="capa-img"><img src="img/075.jpg"></div>
  <h1>${TITULO}</h1>
  <p class="capa-sub">${SUB}</p>
  <div class="capa-selos">
    <span>103 exercícios</span><span>${grupos.length} grupos musculares</span><span>4 planos de treino</span>
  </div>
</section>`;

const comoUsar = `
<section class="pagina texto">
  <h2>Como usar este guia</h2>
  <p>Este guia reúne <strong>103 exercícios de musculação</strong>, cada um com ilustração da posição inicial e final e os músculos trabalhados destacados em vermelho.</p>
  <p>Em cada página você encontra:</p>
  <ul>
    <li><strong>Músculos trabalhados</strong>: os principais músculos recrutados no exercício.</li>
    <li><strong>Execução</strong>: o passo a passo do movimento, do início ao fim.</li>
    <li><strong>Dica</strong>: um detalhe técnico que melhora o resultado.</li>
    <li><strong>Erro comum</strong>: o que evitar para treinar com segurança.</li>
  </ul>
  <p>No final estão <strong>4 planos de treino prontos</strong>, do iniciante ao avançado, que usam os exercícios deste guia. Cada exercício do plano aparece com o seu número (Nº), o mesmo do sumário e do topo da página do exercício, para você consultar a execução.</p>
  <h3>Princípios básicos</h3>
  <ul>
    <li><strong>Aquecimento:</strong> 5 a 10 minutos de atividade leve e 1 a 2 séries leves do primeiro exercício.</li>
    <li><strong>Técnica antes da carga:</strong> só aumente o peso quando conseguir executar todas as repetições com boa forma.</li>
    <li><strong>Progressão:</strong> tente aumentar carga ou repetições aos poucos, semana após semana.</li>
    <li><strong>Descanso:</strong> músculos crescem na recuperação. Durma bem e respeite os dias de descanso.</li>
  </ul>
  <div class="aviso">
    <strong>Aviso importante:</strong> este material tem caráter educativo e não substitui a orientação de um profissional de educação física ou médico. Antes de iniciar qualquer programa de exercícios, consulte um profissional de saúde, principalmente se tiver lesões, dores ou condições médicas.
  </div>
</section>`;

const sumario = `
<section class="pagina sumario">
  <h2>Sumário</h2>
  <div class="colunas">
    ${grupos.map((g) => `
      <div class="grupo-sum">
        <h4>${esc(g.nome)}</h4>
        ${g.itens.map((e) => `<div class="linha"><span class="n">${num(e[0])}</span>${esc(e[1])}</div>`).join('')}
      </div>`).join('')}
    <div class="grupo-sum"><h4>Bônus</h4><div class="linha"><span class="n">★</span>Planos de treino prontos</div></div>
  </div>
</section>`;

const paginaExercicio = ([id, nome, grupo, musculos, passos, dica, erro]) => `
<section class="pagina exercicio">
  <div class="ex-topo"><span class="ex-num">Nº ${num(id)}</span><span class="ex-grupo">${esc(grupo)}</span></div>
  <h2>${esc(nome)}</h2>
  <div class="ex-img"><img src="img/${num(id)}.jpg"></div>
  <div class="ex-musculos"><span class="rotulo">Músculos trabalhados</span>${esc(musculos)}</div>
  <h3>Execução</h3>
  <ol class="passos">${passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
  <div class="caixas">
    <div class="caixa dica"><span class="rotulo">✓ Dica</span>${esc(dica)}</div>
    <div class="caixa erro"><span class="rotulo">✗ Erro comum</span>${esc(erro)}</div>
  </div>
</section>`;

const paginaPlano = (p) => `
<section class="pagina plano">
  <div class="ex-topo"><span class="ex-num">BÔNUS</span><span class="ex-grupo">Plano de treino</span></div>
  <h2>${esc(p.nome)}</h2>
  <p class="plano-desc">${esc(p.descricao)}</p>
  ${p.dias.map((d) => `
    <div class="dia">
      <h4>${esc(d.nome)}</h4>
      <table>
        <thead><tr><th>Nº</th><th>Exercício</th><th>Séries x Reps</th></tr></thead>
        <tbody>${d.itens.map(([id, sr]) => `<tr><td class="n">${num(id)}</td><td>${esc(porId.get(id)[1])}</td><td class="sr">${esc(sr)}</td></tr>`).join('')}</tbody>
      </table>
    </div>`).join('')}
</section>`;

const css = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
:root { --escuro: #16181d; --verm: #e2452b; --cinza: #5b6270; --claro: #f3f4f6; --linha: #e3e5e9; }
body { margin: 0; font-family: 'Liberation Sans', 'DejaVu Sans', sans-serif; color: var(--escuro); font-size: 11pt; line-height: 1.5; }
.pagina { width: 210mm; height: 297mm; padding: 18mm 18mm 20mm; page-break-after: always; position: relative; overflow: hidden; }
h1, h2, h3, h4 { margin: 0; line-height: 1.2; }

.capa { background: var(--escuro); color: #fff; display: flex; flex-direction: column; padding: 22mm 18mm; }
.capa-topo { letter-spacing: .25em; font-size: 9pt; color: #aab0bb; font-weight: bold; }
.capa-img { background: #fff; border-radius: 6mm; margin: 14mm 0 12mm; padding: 4mm; }
.capa-img img { width: 100%; display: block; }
.capa h1 { font-size: 40pt; font-weight: 800; letter-spacing: -.01em; }
.capa h1::after { content: ''; display: block; width: 28mm; height: 2mm; background: var(--verm); margin-top: 7mm; }
.capa-sub { font-size: 15pt; color: #d7dae0; margin: 7mm 0 0; max-width: 150mm; }
.capa-selos { margin-top: auto; display: flex; gap: 4mm; }
.capa-selos span { border: 1px solid #454a55; border-radius: 99px; padding: 2mm 5mm; font-size: 10pt; color: #fff; }

.texto h2, .sumario h2 { font-size: 24pt; margin-bottom: 7mm; }
.texto h2::after, .sumario h2::after { content: ''; display: block; width: 16mm; height: 1.5mm; background: var(--verm); margin-top: 4mm; }
.texto h3 { font-size: 14pt; margin: 7mm 0 2mm; }
.texto p { margin: 0 0 3mm; }
.texto ul { margin: 0 0 3mm; padding-left: 6mm; }
.texto li { margin-bottom: 1.5mm; }
.aviso { margin-top: 8mm; background: var(--claro); border-left: 1.2mm solid var(--verm); padding: 4mm 5mm; font-size: 9.5pt; color: #3b404a; }

.sumario .colunas { column-count: 3; column-gap: 7mm; font-size: 8.3pt; line-height: 1.35; }
.grupo-sum { break-inside: avoid; margin-bottom: 3.5mm; }
.grupo-sum h4 { font-size: 9pt; color: var(--verm); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 1mm; }
.linha { display: flex; gap: 2mm; }
.linha .n { color: var(--cinza); font-weight: bold; min-width: 7mm; }

.ex-topo { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--linha); padding-bottom: 3mm; margin-bottom: 6mm; }
.ex-num { font-weight: 800; color: var(--verm); letter-spacing: .08em; font-size: 10pt; }
.ex-grupo { background: var(--escuro); color: #fff; border-radius: 99px; padding: 1mm 4mm; font-size: 9pt; font-weight: bold; }
.exercicio h2, .plano h2 { font-size: 23pt; font-weight: 800; margin-bottom: 5mm; }
.ex-img { border: 1px solid var(--linha); border-radius: 4mm; padding: 3mm; margin-bottom: 6mm; }
.ex-img img { width: 100%; display: block; max-height: 95mm; object-fit: contain; }
.rotulo { display: block; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: .08em; color: var(--cinza); margin-bottom: 1mm; }
.ex-musculos { background: var(--claro); border-radius: 3mm; padding: 3.5mm 5mm; margin-bottom: 6mm; font-size: 11.5pt; }
.exercicio h3 { font-size: 13pt; margin-bottom: 3mm; }
.passos { margin: 0 0 6mm; padding: 0; list-style: none; counter-reset: p; }
.passos li { counter-increment: p; position: relative; padding-left: 10mm; margin-bottom: 3mm; min-height: 7mm; }
.passos li::before { content: counter(p); position: absolute; left: 0; top: -.3mm; width: 6.5mm; height: 6.5mm; border-radius: 50%; background: var(--escuro); color: #fff; font-weight: bold; font-size: 9.5pt; display: flex; align-items: center; justify-content: center; }
.caixas { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.caixa { border-radius: 3mm; padding: 4mm 5mm; font-size: 10.5pt; }
.caixa.dica { background: #eaf6ee; border-left: 1.2mm solid #2f9e5a; }
.caixa.dica .rotulo { color: #237a45; }
.caixa.erro { background: #fdeeeb; border-left: 1.2mm solid var(--verm); }
.caixa.erro .rotulo { color: #b83520; }

.plano-desc { color: var(--cinza); margin: 0 0 6mm; }
.dia { margin-bottom: 6mm; break-inside: avoid; }
.dia h4 { font-size: 12pt; margin-bottom: 2mm; }
table { width: 100%; border-collapse: collapse; font-size: 10pt; }
th { text-align: left; font-size: 8.5pt; text-transform: uppercase; letter-spacing: .06em; color: var(--cinza); border-bottom: 1.5px solid var(--escuro); padding: 1.5mm 2mm; }
td { border-bottom: 1px solid var(--linha); padding: 1.8mm 2mm; }
td.n { color: var(--verm); font-weight: bold; width: 14mm; }
td.sr { width: 34mm; font-weight: bold; }

.rodape { position: absolute; bottom: 9mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; font-size: 8pt; color: #9aa0ab; }
.capa .rodape { display: none; }
`;

// Amostra grátis: capa, como usar, 5 exercícios e uma página de convite para o guia completo
const AMOSTRA = [75, 5, 12, 86, 27];
const capaAmostra = capa.replace('MUSCULAÇÃO · GUIA PRÁTICO', 'AMOSTRA GRÁTIS · 5 DE 103 EXERCÍCIOS');
const convite = `
<section class="pagina texto">
  <h2>Gostou? Isso foi só o começo.</h2>
  <p>Você acabou de ver <strong>5 dos 103 exercícios</strong> do <strong>${TITULO}</strong>.</p>
  <p>No guia completo você recebe:</p>
  <ul>
    <li><strong>103 exercícios ilustrados</strong> de ${grupos.length} grupos musculares: peito, costas, ombros, braços, abdômen, pernas, glúteos e mais.</li>
    <li>Execução passo a passo, dica técnica e erro comum em cada exercício.</li>
    <li><strong>4 planos de treino prontos</strong>: Iniciante, ABC, ABCDE e Foco em glúteos.</li>
    <li>PDF para ler no celular ou imprimir, com acesso imediato após a compra.</li>
  </ul>
  <div class="aviso"><strong>Garanta já o guia completo</strong> pelo mesmo link onde você baixou esta amostra.</div>
</section>`;

function montar(lista) {
  return lista.map((html, i) =>
    html.replace(/<\/section>\s*$/, `<div class="rodape"><span>${TITULO}</span><span>${i + 1}</span></div></section>`));
}

const versoes = [
  { arquivo: 'Guia-Ilustrado-103-Exercicios.pdf',
    paginas: montar([capa, comoUsar, sumario, ...exercicios.map(paginaExercicio), ...planos.map(paginaPlano)]) },
  { arquivo: 'Amostra-Gratis-Guia-Ilustrado.pdf',
    paginas: montar([capaAmostra, comoUsar, ...AMOSTRA.map((id) => paginaExercicio(porId.get(id))), convite]) },
];

const browser = await chromium.launch();
for (const v of versoes) {
  const arqHtml = path.join(build, v.arquivo.replace('.pdf', '.html'));
  writeFileSync(arqHtml, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${TITULO}</title><style>${css}</style></head><body>${v.paginas.join('')}</body></html>`);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(arqHtml).href, { waitUntil: 'networkidle' });
  await page.pdf({ path: path.join(aqui, v.arquivo), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.close();
  console.log('PDF gerado:', v.arquivo, `(${v.paginas.length} páginas)`);
}
await browser.close();
