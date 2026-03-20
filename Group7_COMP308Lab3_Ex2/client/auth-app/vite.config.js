import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "authApp",
      filename: "remoteEntry.js",
      exposes: {
        "./AuthPage": "./src/AuthPage.jsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
        "react-router-dom": { singleton: true, requiredVersion: "^7.13.0" },
        "@apollo/client": { singleton: true, requiredVersion: "^3.11.3" },
        graphql: { singleton: true, requiredVersion: "^16.12.0" },
      },
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5175,
    strictPort: true,
  },
  preview: {
    port: 5175,
    strictPort: true,
  },
});
