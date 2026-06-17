# Interface (React + Vite + TypeScript). Servida pelo dev server do Vite.
FROM node:20-alpine
WORKDIR /app

# Instala dependências primeiro (cache de camada).
COPY package*.json ./
RUN npm install

# Código-fonte.
COPY . .

EXPOSE 5173
# host:true já está no vite.config.ts, então o Vite escuta em 0.0.0.0.
CMD ["npm", "run", "dev"]
