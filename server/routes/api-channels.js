/*  Routes
  GET /api/groups/:group_id/channels
  POST/api/channel/:id
  DELETE/api/channel/:id
*/
module.exports = {
  route: async (app) => {
    const Channel = require("../models/channel.js");
    const { readJson, writeJson } = require("../db-manager.js");
    const user_path = "../data/user.txt";
    const group_path = "../data/group.txt";
    const channel_path = "../data/channel.txt";

    function attachUser(req, res, next) {
      const users = readJson(user_path) ?? [];
      // get id from header
      const username = req.header("username");

      if (!username) {
        return res
          .status(404)
          .json({ error: "api-channel.js: User not found in header." });
      }

      // find user
      const user = users.find((u) => u.username === username) || null;
      if (!user) {
        return res
          .status(404)
          .json({ error: "api-channel.js: User not found in database." });
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
        return res
          .status(404)
          .json({
            error:
              "GET/api/groups/:group_id/channels = Group not found in database",
          });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res
          .status(404)
          .json({ error: "GET/api/groups/:group_id/channels = No permission" });
      }

      const groupChannels = channels.filter((c) => c.group_id === group_id);
      return res.json(groupChannels);
    });

    // create channel
    app.post("/api/channel/:id", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];

      const { id } = req.params;
      const { name } = req.body || {};

      const group = groups.find((g) => g.id === id);

      if (!name)
        return res
          .status(404)
          .json({ error: "POST/api/channel/:id = Channel name required" });

      const user = req.user;
      if (user.role !== "super-admin" && group.creator !== user.username) {
        return res
          .status(404)
          .json({
            error:
              "POST/api/channel/:id = Only super and creator are allowed to create groups",
          });
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

    // delete channel
    app.delete("/api/channel/:id", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];

      const { id: channel_id } = req.params;
      if (!channel_id)
        return res
          .status(404)
          .json({ error: "Delete/api/channel/:id = Channel id required" });

      const channelIndex = channels.findIndex((c) => c && c.id === channel_id);
      if (channelIndex === -1)
        return res
          .status(404)
          .json({ error: "Delete/api/channel/:id = Channel not found" });

      const channel = channels[channelIndex];

      // check permission
      const user = req.user;
      if (user.role !== "super-admin" && group.creator !== user.username) {
        return res
          .status(404)
          .json({
            error:
              "Delete/api/channel/:id = Only super and creator are allowed to delete channels",
          });
      }
      const group = groups.find((g) => g && g.id === channel.group_id);
      if (!group)
        return res
          .status(404)
          .json({
            error:
              "Delete/api/channel/:id = Group not found while deleting channel",
          });

      channels.splice(channelIndex, 1);
      writeJson(channel_path, channels);
      return res.json({deleted: channel.id});
    });
  },
};
