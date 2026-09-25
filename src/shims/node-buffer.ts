import { Buffer } from "buffer";

// Midnight.js still reaches a few Node-compatible helpers while constructing
// and serializing browser transactions. Vite intentionally does not expose a
// global Buffer, so install the maintained browser implementation before the
// SDK modules are evaluated.
const browserGlobal = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
};

browserGlobal.Buffer ??= Buffer;
