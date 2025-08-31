/*  Routes
GET /api/groups/:group_id/channels
*/
module.exports = {
  route: async (app) => {
    const Channel = require("../models/channel.js");
    const { readJson, writeJson } = require("../db-manager.js");
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

    // ____________ CHANNELS ____________
    // list channels api call
    app.get("/api/groups/:group_id/channels", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const channels = readJson(channel_path) ?? [];
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

    app.post("/api/channel/:id", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];

      const { id } = req.params;
      const { name } = req.body || {};

      if (!name)
        return res.status(404).json({ error: "Channel name required" });

      const user = req.user;
      if (user.role !== "super-admin" && user.role !== "group-admin") {
        return res.status(404).json({ error: "Not allowed to create groups" });
      }

      let channel_id;
      if (channels.length > 0) {
        const last_channel = channels[channels.length - 1];
        const last_num = parseInt(last_channel.id.replace(/^c/, ""), 10);
        const next_num = last_num + 1;
        channel_id = "c" + next_num.toString().padStart(3, "0");
      } else {
        channel_id = "c001";
      }

      const banned_users = [];

      const new_channel = new Channel(channel_id, name, id, banned_users);

      channels.push(new_channel);
      writeJson(channel_path, channels);
      return res.json(new_channel);
    });
  },
};
