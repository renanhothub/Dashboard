# Dashboard

Dashboard de gestão de produção de vídeo UGC (User Generated Content).

Cobre 4 áreas principais:
- **Pipeline de produção**: quadro kanban (roteiro → gravação → edição → revisão → publicado)
- **Biblioteca de scripts & hooks**: roteiros e ganchos reutilizáveis, com notas de performance
- **Criadores UGC**: cadastro de criadores, contato e valor por vídeo
- **Métricas**: views, curtidas, comentários e compartilhamentos dos vídeos publicados

## Stack

- **Backend**: Node.js + Express + SQLite (`server/`)
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Recharts (`client/`)

## Como rodar localmente

### 0. Baixar o projeto (primeira vez)

```bash
git clone https://github.com/renanhothub/Dashboard.git
cd Dashboard
```

### 1. Backend

```bash
cd server
npm install
npm run seed   # popula o banco com dados de exemplo (opcional)
npm run dev    # http://localhost:3001
```

### 2. Frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev    # http://localhost:5173
```

O Vite já está configurado para fazer proxy de `/api` para `http://localhost:3001`.

## Estrutura da API

| Rota | Descrição |
|---|---|
| `GET/POST /api/creators` | Criadores UGC |
| `GET/POST /api/scripts` | Scripts e hooks |
| `GET/POST /api/videos` | Vídeos no pipeline |
| `PATCH /api/videos/:id/status` | Mover vídeo entre etapas do pipeline |
| `GET/POST /api/metrics` | Métricas de performance por vídeo |
| `GET /api/metrics/summary` | Resumo agregado (totais, por vídeo, por plataforma, contagem do pipeline) |

Por enquanto o app roda isolado, sem integrações externas (Meta Ads, Airtable, etc.) — cada área usa dados próprios armazenados no SQLite local.
