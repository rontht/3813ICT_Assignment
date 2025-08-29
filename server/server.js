const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const User = require("./user.js");

app.use(cors());
app.use(express.json());

// superadmin data
const users = [new User("1", "ron", "ron@com", "123", ["super"], ["general"])];

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

// route to display all users for testing
app.get("/", function (req, res) {
  res.json(users);
});


require("./socket.js").connect(io, PORT);
require("./listen.js").listen(server, PORT);
