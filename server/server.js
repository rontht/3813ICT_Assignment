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

// ____________ AUTH ____________
// auth api call
app.post("/api/auth", (req, res) => {
  const { email, password } = req.body;

  // find a matching user
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.json({ valid: false });

  user.valid = true;
  res.json(user);
});

// ____________ GROUPS ____________
// list groups api call
app.get("/api/groups", (req, res) => {
  res.json(groups);
});

// ____________ CHANNELS ____________
// list channels api call
app.get("/api/groups/:group_id/channels", (req, res) => {
  const { group_id } = req.params;

  const group = groups.find((g) => g.id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const groupChannels = channels.filter((c) => c.group_id === group_id);
  res.json(groupChannels);
});

// ____________ DEBUG ____________
// route to display all users for testing
app.get("/", (req, res) => {
  res.json({ users, groups, channels });
});

require("./socket.js").connect(io, PORT);
require("./listen.js").listen(server, PORT);
