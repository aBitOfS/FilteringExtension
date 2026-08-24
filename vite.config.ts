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
            // mkdirSync(resolve(root, outDir, "content"), { recursive: true });
            cpSync(resolve(root, "src/manifest.json"), resolve(root, outDir, "manifest.json"));
            cpSync(resolve(root, "src/content.css"), resolve(root, outDir, "content.css"));
        }
    };
}
function copyDemoFiles(): Plugin {
    return {
        name: "copy-demo-files",
        apply: "build",
        closeBundle() {
            cpSync(resolve(root, "demoData"),resolve(root,"demo/demoData"),{"recursive": true});
        }
    };
}

export default defineConfig(({ mode }) => {
    const buildingContent = mode === "content";

    if (mode === "demo") {
        console.log("Manually copy demoData/ to demo/demoData/");
        return { "build": { outDir: "demo", emptyOutDir: false }, plugins: [copyDemoFiles()] };
    }
    return {
        plugins: [copyExtensionFiles()],
        build: {
            outDir,
            emptyOutDir: false,
            target: "chrome120",
            minify: false,
            rollupOptions: {
                input: buildingContent
                    ? { content: resolve(root, "src/content.ts") }
                    : { background: resolve(root, "src/background.ts") },
                output: {
                    format: "iife",
                    entryFileNames: "[name].js"
                }
            }
        },
        server: {
            host: true, // Nasłuchuj na wszystkich adresach, umożliwiając dostęp z Windowsa
            port: 5173, // Domyślny port Vite
            strictPort: true,
            hmr: {
                clientPort: 5173, // Wymusza poprawne przekazywanie portu dla HMR
            },
            watch: {
                usePolling: true, // Maybe fix checking changes with wsl on windows fs (should work without on linux fs)
            },
        },
    };
});
