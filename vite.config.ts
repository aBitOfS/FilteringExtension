import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = "dist";

function copyExtensionFiles(): Plugin {
    return {
        name: "copy-extension-files",
        apply: "build",
        closeBundle() {
            mkdirSync(resolve(root, outDir, "content"), { recursive: true });
            cpSync(resolve(root, "src/manifest.json"), resolve(root, outDir, "manifest.json"));
            cpSync(resolve(root, "src/content/content.css"), resolve(root, outDir, "content/content.css"));
        }
    };
}

export default defineConfig(({ mode }) => {
    const buildingContent = mode === "content";

    return {
        plugins: [copyExtensionFiles()],
        build: {
            outDir,
            emptyOutDir: false,
            target: "chrome120",
            minify: false,
            rollupOptions: {
                input: buildingContent
                    ? { "content/content": resolve(root, "src/content/content.ts") }
                    : { background: resolve(root, "src/background.ts") },
                output: {
                    format: "iife",
                    entryFileNames: "[name].js"
                }
            }
        }
    };
});
