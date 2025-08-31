/*  Routes
    /
    /api/auth
*/
module.exports = {
  route: async (app) => {
    const { readJson, writeJson } = require("../db-manager.js");
    const user_path = "../data/user.json";
    const User = require("../models/user.js");

    // ____________ DEBUG ____________
    // route to display all users for testing
    app.get("/", (req, res) => {
      res.json({ users, groups, channels });
    });

    // ____________ AUTH ____________
    // auth api call
    app.post("/api/auth", (req, res) => {
      const { email, password } = req.body;

      const users = readJson(user_path) ?? [];

      // find a matching user
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) {
        return res.json({ valid: false });
      }

      user.valid = true;
      return res.json(user);
    });

    // register api call
    app.post("/api/auth/register", (req, res) => {
      const { username, name, email, role, password } = req.body || {};

      // check if any missing
      if (!username || !name || !email || !role || !password) {
        return res.status(401).json({ error: "Missing fields" });
      }

      const users = readJson(user_path) ?? [];

      // check if username and email already exist
      if (users.some((u) => u.username === username)) {
        return res.status(402).json({ error: "Username already exists" });
      }
      if (users.some((u) => u.email === email)) {
        return res.status(403).json({ error: "Email already exists" });
      }

      // fill into user model
      const new_user = new User(
        username,
        name,
        email,
        password,
        role,
        []
      );

      // write into Json
      users.push(new_user);
      writeJson(user_path, users);

      //valid true to all login
      new_user.valid = true;
      return res.json(new_user);
    });
  },
};
