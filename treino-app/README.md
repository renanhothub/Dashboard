# Evolution

App de treino para celular (PWA) com biblioteca de exercícios organizada por **músculo → porção muscular → variações**.

- 11 grupos musculares, 32 porções e 100 exercícios (mínimo de 3 variações por porção)
- Cada exercício tem ilustração em dois quadros, **início e fim**, com o músculo-alvo destacado em vermelho, além de um modo de animação
- Passo a passo da execução, dica do personal, nível e prescrição (séries x repetições · descanso)
- **Meus treinos**: monte Treino A, B, C… com os exercícios escolhidos, número de séries e ordem
- **Registro de treino**: carga e repetições de cada série, com a carga da última vez como referência e cronômetro de descanso automático
- **Histórico**: sessões realizadas, volume total e evolução de carga por exercício
- **Conta na nuvem**: treinos, cargas, histórico e favoritos sincronizados entre aparelhos
- **Convide seus amigos**: competições de presença com check-in por foto (1 ponto por dia), ranking, feed de fotos com 💪 e convite por link/código
- Busca, favoritos e funcionamento offline (instalável na tela inicial)

## Rodar localmente

```bash
cd treino-app
npm install && (cd server && npm install)
npm run server   # API em http://localhost:3002 (terminal 1)
npm run dev      # app em http://localhost:5174 (terminal 2)
```

Testes do servidor: `cd server && npm test`.

## Publicar (para usar no celular com os amigos)

O app e o servidor rodam juntos em um único serviço (`Dockerfile`). O servidor guarda o banco (SQLite)
e as fotos na pasta definida em `DATA_DIR`, que **precisa ser um disco persistente**.

**Render (recomendado):** em render.com → *New → Blueprint* → escolha este repositório. O arquivo
`render.yaml` já cria o serviço com um disco de 1 GB (plano Starter, pago — o plano grátis não tem disco
e apagaria os dados). Depois é só abrir o endereço gerado no celular e "Adicionar à tela inicial".

**Render grátis (só para testar):** *New → Web Service* → repositório `Dashboard`, branch do app,
*Root Directory* `treino-app`, linguagem *Docker*, instância *Free*. Atenção: no plano grátis o servidor
dormiria após 15 min sem uso (apagando os dados). Para evitar isso, o servidor visita o próprio endereço
público a cada 10 min (`RENDER_EXTERNAL_URL`, definido pelo Render; desative com `KEEP_AWAKE=0`).
Os dados ainda são apagados a cada nova publicação/reinício — para guardá-los de vez, use o plano pago com disco.

Qualquer serviço que rode Docker com volume persistente também funciona (Railway, Fly.io, VPS).

Para instalar no celular: abra o endereço no navegador e use "Adicionar à tela inicial".

## Estrutura

- `src/data/muscles/*.ts` — conteúdo (músculos, porções, exercícios, textos e poses)
- `src/illustration/` — motor das ilustrações: boneco articulado (`kinematics.ts`), desenho no estilo atlas anatômico (`Figure.tsx`) e quadros/animação (`ExerciseAnimation.tsx`)
- `#/dev` — folha de revisão com todas as ilustrações

### Adicionar um exercício

Cada exercício define duas poses (`a` = início, `b` = fim) com ângulos das articulações
(0 = para baixo, 90 = para frente, 180 = para cima), os equipamentos (`gear`), o cenário (`props`)
e as regiões destacadas (`hl`). Use os moldes de `src/data/scenes.ts` (banco reto, inclinado, em pé, sentado…).
