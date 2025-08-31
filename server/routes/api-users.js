/*  Routes
    GET /api/groups/:group_id/members
    GET /api/groups/:group_id/requests
    GET /api/channels/:channel_id/banned
    GET /api/users
*/
module.exports = {
  route: async (app) => {
    const { readJson } = require("../db-manager.js");
    const user_path = "../data/user.json";
    const group_path = "../data/group.json";
    const channel_path = "../data/channel.json";

    function attachUser(req, res, next) {
      const users = readJson(user_path) ?? [];
      
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

    // ____________ USERS ____________
    // list users api call for specific group
    app.get("/api/groups/:group_id/members", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
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

    // list requested users api call for specific group
    app.get("/api/groups/:group_id/requests", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
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
      const requests = group.requests
        .map((username) => users.find((user) => user.username === username))
        .map((user) => ({
          username: user.username,
          name: user.name,
          role: user.role,
        }));

      return res.json(requests);
    });

    // list banned users api call for specific channel
    app.get("/api/channels/:channel_id/banned", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
      const { channel_id } = req.params;

      // find the channel
      const channel = channels.find((g) => g.id === channel_id);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found in database" });
      }

      // find the group
      const group = groups.find((g) => g.id === channel.group_id);
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
      const banned_users = channel.banned_users
        .map((username) => users.find((user) => user.username === username))
        .map((user) => ({
          username: user.username,
          name: user.name,
          role: user.role,
        }));

      return res.json(banned_users);
    });

    // list all users for super admins
    app.get("/api/users", attachUser, (req, res) => {
      const users = readJson(user_path) ?? [];
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      if (user.role !== "super-admin")
        return res.status(403).json({ error: "Forbidden" });

      return res.json(
        users.map((user) => ({
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        }))
      );
    });
  },
};
