import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mdx from '@mdx-js/rollup';
import path from "path";
// Assuming componentTagger is a custom plugin, ensure it's properly imported or defined
// For demonstration purposes, let's assume it's defined in a local file named componentTagger.ts
import { componentTagger } from './componentTagger';

const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

const plugins = [
  mdx(),
  react(),
  // Conditionally include componentTagger based on the mode
  isNode && process.env.NODE_ENV === 'development' ? componentTagger() : null,
].filter(Boolean);

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/assets": {
        target: "https://whtssub.github.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assets/, ""),
      },
    },
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
});
