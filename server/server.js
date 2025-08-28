const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();

// Defining server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const options = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
};
const io = require("socket.io")(server, options);

// use the dependencies
app.use(cors());
app.use(express.json());

require("./socket.js").connect(io, PORT);
require("./listen.js").listen(server, PORT);
