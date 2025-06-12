import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "VITE_") };

  return {
    plugins: [react(), tailwindcss()],
    envPrefix: "VITE_",
    build: {
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
