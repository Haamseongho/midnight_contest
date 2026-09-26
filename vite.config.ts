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
  plugins: [wasm(), {
    name: "audit-reviewer-isolation",
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(x => x.type === "chunk" && x.facadeModuleId?.endsWith("/review.html"));
      if (!entry || entry.type !== "chunk") this.error("Missing reviewer build entry");
      const seen = new Set<string>();
      const modules = new Set<string>();
      const visit = (name: string) => {
        if (seen.has(name)) return;
        seen.add(name);
        const chunk = bundle[name];
        if (!chunk || chunk.type !== "chunk") return;
        for (const id of Object.keys(chunk.modules)) modules.add(id);
        for (const dependency of [...chunk.imports, ...chunk.dynamicImports]) visit(dependency);
      };
      visit(entry.fileName);
      // The public SDK's utils depend on address-format (encoding only), not a
      // wallet session. Permit that exact package, never other wallet packages.
      const forbidden = [...modules].filter(id => /\/src\/(main\.ts|demo\/|ui\/(roles|judge-guide|scenario-panel)|network\/(midnight|operations)\.ts)|midnight-js-(contracts|http-client-proof-provider|fetch-zk-config-provider)|\/wallet-sdk(?!-address-format\/)|dapp-connector-api/.test(id));
      if (forbidden.length) this.error(`Reviewer loads forbidden modules: ${forbidden.join(", ")}`);
      this.emitFile({type: "asset", fileName: "reviewer-bundle-audit.json", source: JSON.stringify({entry: entry.fileName, chunks: [...seen], forbiddenModules: forbidden, allowedAddressCodec: "wallet-sdk-address-format: public SDK encoding dependency, not a wallet session", checked: true}, null, 2)});
    },
  }],
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
  build: { target: "esnext", manifest: true, rollupOptions: { input: {
    main: fileURLToPath(new URL("./index.html", import.meta.url)),
    reviewer: fileURLToPath(new URL("./review.html", import.meta.url)),
  } } },
});
