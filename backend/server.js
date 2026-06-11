const express = require("express");
const http = require("http");

const app = express();
const config = require("./configs/app");
const { initSocket } = require("./configs/socket");
const { log } = require("console");

// Express Configs
require("./configs/express")(app);

// Middleware
require("./configs/middleware");

// Routes
app.use(require("./routes"));

// Error handler
require("./configs/errorHandler")(config.isProduction, app);

// Create HTTP Server & attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Start Server
server.listen(config.port, () => {
  const addr = server.address();

  console.log(`Server is running at http://${addr.address}:${addr.port}`);
});
