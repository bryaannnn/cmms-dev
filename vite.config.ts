import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteImagemin from "vite-plugin-imagemin";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "VITE_") };

  return {
    plugins: [
      react(),
      tailwindcss(),
      // 🔹 Kompres gambar otomatis (JPEG, PNG, SVG, WebP)
      viteImagemin({
        gifsicle: { optimizationLevel: 7 },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 70 },
        pngquant: { quality: [0.6, 0.8], speed: 4 },
        svgo: { plugins: [{ name: "removeViewBox" }, { name: "removeEmptyAttrs", active: false }] },
        webp: { quality: 75 },
      }),

      // 🔹 Gzip & Brotli compression
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "brotliCompress", // atau "gzip"
        ext: ".br",
      }),
    ],
    envPrefix: "VITE_",
    build: {
      target: "es2018",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.debug"],
          passes: 2,
        },
        format: {
          comments: false,
        },
      },
      outDir: "dist",
      sourcemap: mode !== "production",
      //env.VITE_GENERATE_SOURCEMAP === "true",
      rollupOptions: {
        output: {
          format: "es",
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
          manualChunks(id: any) {
            if (/projectEnvVariables.ts/.test(id)) return "projectEnvVariables";
          },
        },
      },
    },
    base: "/",
    server: {
      host: "0.0.0.0",
      port: 8082,
      proxy: {
        "/api": {
          target: "http://api.cmms.widatra.com:8181",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3001,
    },
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  };
});

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   envPrefix: 'VITE_',
//   build: {
//     outDir: 'dist',
//   },
//   base: '/react.prod/',
//   server: {
//     host: "192.168.254.212",
//     port: 8082,
//     proxy: {
//       '/api': {
//         target: "http://192.168.254.211:8080",
//         changeOrigin: true
//       }
//     }
//   },
//   preview: {
//     port: 3001,
//   },
// });
