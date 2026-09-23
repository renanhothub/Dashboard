# Publica o app Treino Pro (pasta treino-app) a partir da raiz do repositório.
FROM node:22-slim
WORKDIR /app
COPY treino-app/package.json ./
RUN npm install
COPY treino-app/ ./
RUN npm run build && cd server && npm install --omit=dev
ENV NODE_ENV=production PORT=3002 DATA_DIR=/data
EXPOSE 3002
CMD ["node", "server/src/index.js"]
