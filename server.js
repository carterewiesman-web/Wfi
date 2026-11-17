/*
  Minimal WebSocket relay for v86 (network_relay_url).
  - Bridges binary ethernet frames between connected clients (broadcast to others).
  - Suitable for simple client-to-client networking; it does NOT provide internet/NAT
    on its own (Render containers cannot create TAP interfaces). For WAN internet you
    need a relay/server that performs NAT/SLiRP or bridges to a real network.
  - Deploy target: Render Web Service.
*/

const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("v86 relay ok\n");
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("not found\n");
});

const wss = new WebSocket.Server({ server });

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

wss.on("connection", (ws, req) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const path = req.url || "/";
  ws._meta = { ip, path };
  log("connect", ip, path, "clients=" + wss.clients.size);

  ws.on("message", (data, isBinary) => {
    // v86 sends binary ethernet frames; forward as-is to other clients
    for (const client of wss.clients) {
      if (client === ws) continue;
      if (client.readyState !== WebSocket.OPEN) continue;
      try {
        client.send(data, { binary: isBinary });
      } catch (e) {
        // ignore send errors
      }
    }
  });

  ws.on("close", (code, reason) => {
    log("close", ip, code, String(reason || ""), "clients=" + wss.clients.size);
  });

  ws.on("error", (err) => {
    log("error", ip, err && err.message ? err.message : String(err));
  });
});

server.listen(PORT, () => {
  log("listening on", PORT);
});
