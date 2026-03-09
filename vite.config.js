import { defineConfig } from "vite";
import { resolve } from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html")
            }
        }
    },
    plugins: [
        ViteImageOptimizer({
            jpg: {
                quality: 75
            },
            jpeg: {
                quality: 75
            },
            webp: {
                quality: 70
            },
            png: {
                quality: 75
            }
        })
    ]
});