import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O proxy faz o frontend (porta 5173) conversar com a API (porta 3001)
// sem precisar configurar CORS no navegador. Toda chamada para "/api/..."
// é redirecionada para o backend.
//
// O alvo do proxy é configurável por VITE_API_PROXY: localmente fica em
// http://localhost:3001 (padrão); no Docker o compose define http://api:3001.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escuta em 0.0.0.0 — necessário pra acessar de fora do container
    port: 5173,
    proxy: {
      "/api": process.env.VITE_API_PROXY || "http://localhost:3001",
    },
  },
});
