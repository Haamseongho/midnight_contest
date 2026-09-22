// isomorphic-ws exposes only a default browser export. Midnight's indexer
// provider also expects its named WebSocket export, so provide both.
const BrowserWebSocket = globalThis.WebSocket;

export { BrowserWebSocket as WebSocket };
export default BrowserWebSocket;
