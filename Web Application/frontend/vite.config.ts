import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5100",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@/common": "/src/common",
      "@/pages": "/src/pages",
      "@/modules": "/src/modules",
      "@/clients": "/src/clients",
      "@/assets": "/src/assets",
    },
  },
});
