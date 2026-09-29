# Lançamento: Guia Ilustrado de Musculação

Passo a passo para começar a vender hoje.

## O que já está pronto

| Arquivo | Para quê |
|---|---|
| `Guia-Ilustrado-103-Exercicios.pdf` | O produto (110 páginas). **Fica só no seu computador:** está no `.gitignore` porque o repositório é público. |
| `Amostra-Gratis-Guia-Ilustrado.pdf` | Isca grátis (5 exercícios) para atrair compradores nas redes sociais. |
| `pagina-de-vendas/` | Página de vendas pronta (celular e computador). |
| `gerar-pdf.mjs` | Gera os dois PDFs de novo se você alterar o texto em `exercicios.mjs`. Comando: `node produto/gerar-pdf.mjs` |

## Passo 1: proteger o produto (5 min)

O repositório `renanhothub/Dashboard` é **público**, e as 103 ilustrações originais estão nele. Qualquer pessoa pode baixá-las e montar o guia sem pagar.
**Recomendado:** GitHub → repositório → *Settings* → *General* → *Danger Zone* → *Change visibility* → **Private**.

## Passo 2: cadastrar o produto na Kiwify (20 min)

1. Crie uma conta grátis em **kiwify.com.br** (pede CPF e conta bancária para receber). A Hotmart também serve.
2. *Produtos* → *Criar produto* → tipo **E-book / arquivo**.
3. Preencha:
   - **Nome:** Guia Ilustrado de Musculação: 103 Exercícios
   - **Descrição:** 103 exercícios de musculação ilustrados, com os músculos trabalhados destacados, execução passo a passo, dica técnica e erro comum em cada exercício. Inclui 4 planos de treino prontos (iniciante, ABC, ABCDE e foco em glúteos). PDF com acesso imediato.
   - **Preço:** R$ 27,90 (sugestão de lançamento; depois teste R$ 37,90)
   - **Garantia:** 7 dias (obrigatória pelo Código de Defesa do Consumidor)
   - **Arquivo de entrega:** `Guia-Ilustrado-103-Exercicios.pdf`
   - **Capa:** tire um print da página 1 do PDF
4. Ative **Pix, cartão (parcelado) e boleto**.
5. Copie o **link de checkout** do produto.

> Confira as taxas atuais da plataforma na hora de cadastrar. Elas mudam com o tempo.

## Passo 3: colocar a página de vendas no ar (10 min)

1. Abra `pagina-de-vendas/index.html` num editor de texto, procure `LINK_CHECKOUT = ''` e cole o link da Kiwify entre as aspas.
2. Publique grátis: crie uma conta em **app.netlify.com** → *Add new site* → *Deploy manually* → arraste a pasta `pagina-de-vendas`.
3. Você recebe um endereço do tipo `seu-guia.netlify.app`. Coloque-o na bio do Instagram e do TikTok.

> **Atalho:** se quiser vender ainda hoje, pule o passo 3 e coloque direto o link de checkout da Kiwify na bio.

## Passo 4: divulgação gratuita (todos os dias)

As ilustrações do guia viram conteúdo pronto. Poste 1 ou 2 por dia no Instagram (carrossel e Reels) e no TikTok.

**Estratégia da amostra grátis:** no fim de cada post, escreva *"Comente GUIA que eu te mando 5 exercícios grátis"*. Mande a amostra por direct, e ela termina com o convite para o guia completo.

### 10 posts prontos

1. **Carrossel "3 erros no agachamento"** (imagem 075). Legenda: *Você comete algum desses erros no agachamento? Joelho entrando para dentro na subida é o mais comum. Salve para o próximo treino de pernas. Comente GUIA e receba 5 exercícios ilustrados grátis.*
2. **"Supino reto: execução correta"** (005). *Barra na linha dos mamilos, escápulas encaixadas, sem quicar no peito. Salve e compartilhe com seu parceiro de treino.*
3. **"O exercício que mais trabalha glúteo"** (086, hip thrust). *Queixo para baixo e costelas fechadas no topo. Se a lombar arqueia, o glúteo não trabalha. Comente GUIA.*
4. **"Pare de balançar na elevação lateral"** (027). *Lidere o movimento com os cotovelos, não com as mãos, e use menos carga.*
5. **"Puxada frontal: você puxa com a mão ou com o cotovelo?"** (012).
6. **"Treino ABC completo"** (print da página do plano). *Salve este treino e comece amanhã.*
7. **"Rosca martelo × rosca direta: qual a diferença?"** (040 e 035).
8. **"Treino de glúteo para mulheres"** (plano "Foco em glúteos", com imagens 086, 089 e 103).
9. **"5 exercícios para fazer em casa"** (008, 067, 088, 076, 097).
10. **"Mostrando por dentro o guia de 103 exercícios"** (vídeo passando as páginas do PDF na tela do celular) com o link da bio.

**Hashtags:** #musculacao #treino #academia #hipertrofia #treinodeperna #gluteos #treinoemcasa #dicasdetreino #personaltrainer #fitnessbrasil

## Passo 5: anúncios pagos (opcional, só depois de 1 ou 2 vendas orgânicas)

- Meta Ads (Instagram/Facebook), objetivo **Vendas**, R$ 20 a R$ 30 por dia durante 5 dias.
- Público: Brasil, 18 a 45 anos, interesses em musculação, academia e treino.
- Criativos: os posts 1, 3 e 10 acima.
- Regra: se depois de gastar cerca de R$ 60 não vier nenhuma venda, pause e troque o criativo.

## Expectativa realista

Produto digital não vende sozinho: as vendas vêm da divulgação. Com postagens diárias, é comum as primeiras vendas aparecerem na primeira ou segunda semana. Acompanhe na Kiwify quantas pessoas visitam o checkout e quantas compram, e ajuste preço e posts a partir disso.
