import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "client/index.html"),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-dialog']
        }
      }
    },
    minify: 'terser',
    target: 'es2015'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@vitejs/plugin-react']
  },
  server: {
    port: 3000,
    host: true
  }
}); 