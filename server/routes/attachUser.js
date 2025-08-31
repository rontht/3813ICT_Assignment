module.exports = function attachUser(req, res, next) {
  const { readJson } = require("../db-manager.js");
  const users = readJson("../data/user.json");
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