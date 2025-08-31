/*  Routes
    GET /
    POST /api/auth
    POST /api/auth/register
*/
module.exports = {
  route: async (app) => {
    const { readJson, writeJson } = require("../db-manager.js");
    const user_path = "../data/user.json";
    const group_path = "../data/group.json";
    const channel_path = "../data/channel.json";
    const User = require("../models/user.js");

    // ____________ DEBUG ____________
    // route to display all users for testing
    app.get("/", (req, res) => {
      const users = readJson(user_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const channels = readJson(channel_path) ?? [];
      res.json({ users, groups, channels });
    });

    // ____________ AUTH ____________
    // auth api call
    app.post("/api/auth", (req, res) => {
      const users = readJson(user_path) ?? [];
      const { username, password } = req.body;

      // find a matching user
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) {
        return res.json({ valid: false });
      }

      user.valid = true;
      return res.json({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        groups: user.groups,
        valid: user.valid,
      });
    });

    // register api call
    app.post("/api/auth/register", (req, res) => {
      const users = readJson(user_path) ?? [];
      const { username, name, email, role, password } = req.body || {};

      // check if any missing
      if (!username || !name || !email || !role || !password) {
        return res.status(401).json({ error: "Missing fields" });
      }

      // check if username and email already exist
      if (users.some((u) => u.username === username)) {
        return res.status(402).json({ error: "Username already exists" });
      }
      if (users.some((u) => u.email === email)) {
        return res.status(403).json({ error: "Email already exists" });
      }

      // fill into user model
      const new_user = new User(username, name, email, password, role, []);

      // write into Json
      users.push(new_user);
      writeJson(user_path, users);

      //valid true to all login
      new_user.valid = true;
      return res.json({
        username: new_user.username,
        name: new_user.name,
        email: new_user.email,
        role: new_user.role,
        groups: new_user.groups,
        valid: new_user.valid,
      });
    });
  },
};
