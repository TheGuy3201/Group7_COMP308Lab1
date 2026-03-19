import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "gameProgressApp",
      filename: "remoteEntry.js",
      exposes: {
        "./GameProgressPage": "./src/GameProgressPage.jsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
        "react-router-dom": { singleton: true, requiredVersion: "^7.13.0" },
        "@apollo/client": { singleton: true, requiredVersion: "^3.11.3" },
        graphql: { singleton: true, requiredVersion: "^16.12.0" },

        three: {
          singleton: true,
          requiredVersion: false,
        },
        "@react-three/fiber": { singleton: true },
        "@react-three/drei": { singleton: true },
      },
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    commonjsOptions: {
    include: [/three/, /node_modules/],
  },

  },
  server: {
    port: 5176,
    strictPort: true,
  },
  preview: {
    port: 5176,
    strictPort: true,
  },
});
