const { io } = require("socket.io-client");
const https = require("https");

const USER_ID = "2bc47ac6-0545-4017-a24f-0d74a6bd8022";

// HTTPS agent that accepts self-signed certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const socket = io("https://localhost:8443/notifications", {
  path: "/socket.io",
  transports: ["polling", "websocket"],

  // Make Node accept self-signed TLS for polling + websocket
  agent: httpsAgent,
  rejectUnauthorized: false,

  // Help CORS (some setups require an Origin)
  extraHeaders: {
    Origin: "https://localhost:8443",
  },

  timeout: 20000,
});

socket.on("connect", () => {
  console.log("✅ connected", socket.id, "transport:", socket.io.engine.transport.name);

  socket.emit("register_user", { userId: USER_ID }, (ack) => {
    console.log("register ack:", ack);
  });
});

socket.on("upgrade", () => {
  console.log("⬆️ upgraded transport:", socket.io.engine.transport.name);
});

socket.on("notification", (payload) => {
  console.log("🔔 LIVE notification received:", payload);
});

socket.on("connect_error", (err) => {
  console.error("❌ connect_error:", err.message);
});
