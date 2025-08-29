const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const { users, groups, channels } = require("./mock.js");

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

// auth api call
app.post("/api/auth", (req, res) => {
  const { email, password } = req.body;

  // find a matching user
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    // user matched, set valid = true
    user.valid = true;
    const { id, username, email, roles, groups, valid } = user;
    res.json({ id, username, email, roles, groups, valid });
  } else {
    // no match, return valid = false
    res.json({ valid: false });
  }
});

// list groups api call
app.get("/api/groups", (req, res) => {
  res.json(groups);
});

// list channels api call
app.get("/api/groups/:group_id/channels", (req, res) => {
  const { group_id } = req.params;
  const group = groups.find((g) => g.id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const group_channels = channels.filter((c) => c.group_id === group_id);
  res.json(group_channels);
});

// route to display all users for testing
app.get("/", (req, res) => {
  res.json({ users, groups, channels });
});

require("./socket.js").connect(io, PORT);
require("./listen.js").listen(server, PORT);
