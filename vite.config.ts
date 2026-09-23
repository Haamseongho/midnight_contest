import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [wasm()],
  resolve: {
    alias: [
      { find: /^assert$/, replacement: require.resolve("assert/") },
      {
        find: /^isomorphic-ws$/,
        replacement: fileURLToPath(new URL("./src/shims/browser-websocket.ts", import.meta.url)),
      },
    ],
  },
  build: { target: "esnext" },
});
