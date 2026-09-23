# Treino Pro: app + servidor em um único serviço
FROM node:22-slim
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build && cd server && npm install --omit=dev
ENV NODE_ENV=production PORT=3002 DATA_DIR=/data
EXPOSE 3002
CMD ["node", "server/src/index.js"]
