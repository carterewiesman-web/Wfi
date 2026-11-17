# v86-relay-render

Minimal WebSocket relay for v86 `network_relay_url`, intended for deployment on Render.

## What it does
- Accepts WebSocket connections and broadcasts binary frames to other connected clients.
- Useful for basic frame relay/client-to-client experiments.

## Important limitation
- This relay **does not provide internet access/NAT** by itself. v86 internet networking typically requires a relay/server that bridges the emulated NIC to a real network (e.g. TAP + NAT/SLiRP), which is not generally possible in standard Render web service containers.
- Treat this as a starting point. If v86 needs a specific relay protocol/handshake beyond raw frame broadcast, update `server.js` based on errors.

## Deploy on Render
1. Push this folder to a GitHub/GitLab repo.
2. In Render: **New +** → **Web Service** → connect the repo.
3. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy. Render will provide an HTTPS URL.
5. Use the relay URL in Archv86-v5 as: `wss://<your-service>.onrender.com/`

## Local test
```bash
npm install
npm start
# http://localhost:8080/health -> v86 relay ok
```

## Notes
- Free Render instances may sleep/spin down when idle; first connection can be slow.
- For debugging, check Render logs for connect/message/close events.
