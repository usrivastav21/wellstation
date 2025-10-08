import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = process.env.ELECTRON === "true" || mode === "electron";
  return {
    plugins: [react()],

    base: isElectron ? "./" : "/",

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: mode === "development",
      minify: mode === "production",
      rollupOptions: {
        input: {
          main: "./index.html",
        },
      },
    },

    // TODO: cleanup all the unnecessary configurations
    // Server configuration for development
    server: {
      port: 3000,
      host: "0.0.0.0",
      strictPort: true,
      cors: true,
    },

    // Resolve configuration
    resolve: {
      alias: {
        "@": "/src",
      },
    },

    // Define global variables
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.ELECTRON": JSON.stringify(isElectron),
    },

    // Optimizations
    optimizeDeps: {
      exclude: ["electron"],
    },
  };
});
