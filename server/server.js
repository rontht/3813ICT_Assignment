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

// ____________ For Permission ____________
function attachUser(req, res, next) {
  // get id from header
  const username = req.header("username");
  if (!username) {
    return res.status(404).json({ error: "User not found in header." });
  }

  // find user
  const user = users.find((u) => u.username === username) || null;
  if (!user) {
    return res.status(404).json({ error: "User not found in database." });
  }

  // attach it to request
  req.user = user;
  next();
}

// ____________ AUTH ____________
// auth api call
app.post("/api/auth", (req, res) => {
  const { email, password } = req.body;

  // find a matching user
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.json({ valid: false });
  }

  user.valid = true;
  return res.json(user);
});

// ____________ GROUPS ____________
// list groups api call
app.get("/api/groups", attachUser, (req, res) => {
  // check for permission. if super, get all group
  const user = req.user;
  const isSuper = user.role === "super-admin";
  if (isSuper) {
    return res.json(groups);
  }

  // else, filter groups accordingly
  const filtered_groups = groups.filter(
    (g) => g.creator === user.username || g.members.includes(user.username)
  );
  return res.json(filtered_groups);
});

// ____________ CHANNELS ____________
// list channels api call
app.get("/api/groups/:group_id/channels", attachUser, (req, res) => {
  const { group_id } = req.params;

  // find the group
  const group = groups.find((g) => g.id === group_id);
  if (!group) {
    return res.status(404).json({ error: "Group not found in database" });
  }

  // check for permission
  const user = req.user;
  const isSuper = user.role === "super-admin";
  const isMember = group.members.includes(user.username);
  if (!isSuper && !isMember) {
    return res.status(404).json({ error: "No permission" });
  }

  const groupChannels = channels.filter((c) => c.group_id === group_id);
  return res.json(groupChannels);
});

// ____________ USERS ____________
// list users api call for specific group
app.get("/api/groups/:group_id/members", attachUser, (req, res) => {
  const { group_id } = req.params;

  // find the group
  const group = groups.find((g) => g.id === group_id);
  if (!group) {
    return res.status(404).json({ error: "Group not found in database" });
  }

  // check for permission
  const user = req.user;
  const isSuper = user.role === "super-admin";
  const isMember = group.members.includes(user.username);
  if (!isSuper && !isMember) {
    return res.status(404).json({ error: "No permission" });
  }

  // don't sent all info of users
  // send only what's necessary
  const members = group.members
    .map((username) => users.find((user) => user.username === username))
    .map((user) => ({
      username: user.username,
      name: user.name,
      role: user.role,
    }));

  return res.json(members);
});

// list all users for super admins
app.get('/api/users', attachUser, (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });

  return res.json(users.map(user => ({
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role
  })));
});

// ____________ DEBUG ____________
// route to display all users for testing
app.get("/", (req, res) => {
  res.json({ users, groups, channels });
});

require("./socket.js").connect(io, PORT);
require("./listen.js").listen(server, PORT);
