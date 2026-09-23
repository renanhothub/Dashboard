# Treino Pro

App de treino para celular (PWA) com biblioteca de exercícios organizada por **músculo → porção muscular → variações**.

- 11 grupos musculares, 32 porções e 100 exercícios (mínimo de 3 variações por porção)
- Cada exercício tem ilustração em dois quadros, **início e fim**, com o músculo-alvo destacado em vermelho, além de um modo de animação
- Passo a passo da execução, dica do personal, nível e prescrição (séries x repetições · descanso)
- Busca, favoritos salvos no aparelho e funcionamento offline (instalável na tela inicial)

## Rodar

```bash
cd treino-app
npm install
npm run dev      # abre em http://localhost:5174 (use o IP da rede para abrir no celular)
npm run build    # gera a versão de produção em dist/
```

Para instalar no celular: abra o endereço no navegador e use "Adicionar à tela inicial".

## Estrutura

- `src/data/muscles/*.ts` — conteúdo (músculos, porções, exercícios, textos e poses)
- `src/illustration/` — motor das ilustrações: boneco articulado (`kinematics.ts`), desenho no estilo atlas anatômico (`Figure.tsx`) e quadros/animação (`ExerciseAnimation.tsx`)
- `#/dev` — folha de revisão com todas as ilustrações

### Adicionar um exercício

Cada exercício define duas poses (`a` = início, `b` = fim) com ângulos das articulações
(0 = para baixo, 90 = para frente, 180 = para cima), os equipamentos (`gear`), o cenário (`props`)
e as regiões destacadas (`hl`). Use os moldes de `src/data/scenes.ts` (banco reto, inclinado, em pé, sentado…).
