# API (Node + Express + TypeScript). Roda com tsx — sem etapa de build.
FROM node:20-alpine
WORKDIR /app

# Instala dependências primeiro (cache de camada).
COPY package*.json ./
RUN npm install

# Código-fonte.
COPY . .

EXPOSE 3001
CMD ["npm", "run", "dev"]
