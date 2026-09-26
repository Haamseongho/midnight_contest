import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  // `util` is pulled in transitively by the Midnight browser SDK. Its legacy
  // browser build reads NODE_DEBUG at module evaluation time even though Vite
  // intentionally does not provide a global Node.js `process` object.
  define: {
    "process.env.NODE_DEBUG": "undefined",
  },
  plugins: [wasm()],
  server: { watch: process.env.VITE_TEST ? null : undefined },
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
