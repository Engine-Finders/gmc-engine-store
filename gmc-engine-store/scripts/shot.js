// Accurate screenshot via CDP with device emulation.
// usage: node scripts/shot.js <port> <width> <out.png>
const [, , port = "9333", width = "390", out = "shot.png"] = process.argv;

(async () => {
  const list = await (await fetch(`http://localhost:${port}/json`)).json();
  const page = list.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = {};
  const send = (m, p = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m.result); };
  await new Promise((r) => (ws.onopen = r));
  const w = parseInt(width, 10);
  const mobile = w < 768;
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile });
  await send("Page.enable");
  // measure full height
  const h = await send("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true });
  const height = Math.min(h.result.value, 16000);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height, scale: 1 } });
  require("fs").writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("wrote", out, w + "x" + height);
  ws.close();
})();
