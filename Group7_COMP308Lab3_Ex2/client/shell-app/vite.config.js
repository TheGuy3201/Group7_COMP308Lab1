import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
const { PORT = 3000 } = process.env;
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shellApp",
      remotes: {
        authApp: "http://localhost:5175/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  optimizeDeps: {
    include: [
      '@apollo/client',
      '@apollo/client/core',
      '@apollo/client/cache',
      '@apollo/client/link/http',
      'graphql'
    ],
    esbuildOptions: {
      supported: {
        bigint: true
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:4002`,
        changeOrigin: true,
      },
      "/auth": {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
      "/graphql": {
        target: "http://localhost:4002",
        changeOrigin: true,
      },
    },
  },

  build: {
    target: "esnext",
    manifest: true,
    rollupOptions: {
      input: "./src/main.jsx",
    },
  },
});
