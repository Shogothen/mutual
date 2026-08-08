import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

/**
 * GitHub Pages: the app is served from /<repo>/, so `base` is configurable
 * via VITE_BASE_PATH (set in the deploy workflow). Routing uses hash routing
 * (see docs/DEPLOYMENT.md) so no SPA fallback hack is required.
 */
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        // Deliberately neutral name & icon: nothing on the home screen
        // reveals what the app is about (see docs/PRIVACY_ARCHITECTURE.md).
        name: "Mutual",
        short_name: "Mutual",
        description: "Ein privater Raum für euch beide.",
        theme_color: "#0b0e1a",
        background_color: "#0b0e1a",
        display: "standalone",
        start_url: ".",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
        // Never cache API responses: answers and matches must not persist
        // in the HTTP cache (see docs/PRIVACY_ARCHITECTURE.md).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith("supabase.co"),
            handler: "NetworkOnly"
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
  },
  build: {
    target: "es2022",
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          supabase: ["@supabase/supabase-js"]
        }
      }
    }
  }
}));
