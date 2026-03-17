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
        gameProgressApp: "http://localhost:5176/assets/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.1.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.1.0" },
        "react-router-dom": { singleton: true, requiredVersion: "^7.13.0" },
        "@apollo/client": { singleton: true, requiredVersion: "^3.11.3" },
        graphql: { singleton: true, requiredVersion: "^16.12.0" },
      },
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
    strictPort: true,
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
