import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O proxy faz o frontend (porta 5173) conversar com a API (porta 3001)
// sem precisar configurar CORS no navegador. Toda chamada para "/api/..."
// é redirecionada para o backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
