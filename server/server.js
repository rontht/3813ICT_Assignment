const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// defining server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const options = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};
const io = require("socket.io")(server, options);

require("./routes/api-auth.js").route(app);
require("./routes/api-groups.js").route(app);
require("./routes/api-channels.js").route(app);
require("./routes/api-users.js").route(app);

require("./socket.js").connect(io, PORT);
require("./listen.js").listen(server, PORT);
