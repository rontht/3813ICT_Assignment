/*  Routes
  GET /api/groups
  GET /api/group/:id
  GET /api/search/groups
  POST /api/group/create
  PUT /api/group/:id
  DELETE /api/group/:id
  DELETE /api/group/:id/member
  PATCH /api/group/:id/request
*/
module.exports = {
  route: async (app) => {
    const { readJson, writeJson } = require("../db-manager.js");
    const user_path = "../data/user.txt";
    const group_path = "../data/group.txt";
    const channel_path = "../data/channel.txt";
    const Group = require("../models/group.js");

    function attachUser(req, res, next) {
      const users = readJson(user_path) ?? [];
      // get id from header
      const username = req.header("username");

      if (!username) {
        return res
          .status(404)
          .json({ error: "api-group.js: User not found in header." });
      }

      // find user
      const user = users.find((u) => u.username === username) || null;
      if (!user) {
        return res
          .status(404)
          .json({ error: "api-group.js:User not found in database." });
      }

      // attach it to request
      req.user = user;
      next();
    }

    // ____________ GROUPS ____________
    // get all groups for super
    app.get("/api/groups", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
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

    app.get("/api/group/:id", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      // check for permission. if super, get all group
      const user = req.user;
      const id = req.params.id;
      const group = groups.find((g) => g.id === id);
      // only creators and super admin can view this
      if (user.role === "group-admin" && group.creator !== user.username) {
        return res.status(404).json({
          error: "GET/api/group/:id = Not allowed to view this group",
        });
      }
      return res.json(group);
    });

    // list all groups for searching
    app.get("/api/search/groups", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const channels = readJson(channel_path) ?? [];
      const user = req.user;
      if (!user)
        return res
          .status(401)
          .json({ error: "GET/api/search/groups/ = No user found" });

      // only send necessary group info
      const mapped_groups = groups.map((group) => {
        const groupChannels = channels.filter((c) => c.group_id === group.id);
        return {
          id: group.id,
          name: group.name,
          creator: group.creator,
          isAdmin: group.creator === user.username,
          isMember: group.members.includes(user.username),
          channelCount: groupChannels.length,
          memberCount: group.members.length,
          requests: group.requests,
        };
      });

      return res.json(mapped_groups);
    });

    // create a new group
    app.post("/api/group/", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];

      const user = req.user;
      if (user.role !== "super-admin" && user.role !== "group-admin") {
        return res
          .status(404)
          .json({ error: "POST/api/group/ = Not allowed to create groups" });
      }

      const { name, members = [], requests = [] } = req.body || {};
      if (!name)
        return res
          .status(404)
          .json({ error: "POST/api/group/ = Group name required" });

      let group_id;
      if (groups.length > 0) {
        const last_group = groups[groups.length - 1];
        const last_num = parseInt(last_group.id.replace(/^g/, ""), 10);
        const next_num = last_num + 1;
        group_id = "g" + next_num.toString().padStart(3, "0");
      } else {
        group_id = "g001";
      }

      const new_group = new Group(
        group_id,
        name,
        user.username,
        members,
        requests
      );

      groups.push(new_group);
      writeJson(group_path, groups);
      return res.json(new_group);
    });

    // edit a group
    app.put("/api/group/:id", attachUser, (req, res) => {
      const user = req.user;

      const groups = readJson(group_path) ?? [];
      const { id } = req.params;

      const group = groups.find((g) => g.id === id);
      if (!group) {
        return res
          .status(404)
          .json({ error: "PUT/api/group/:id = Group not found in database" });
      }
      const index = groups.findIndex((g) => g.id === id);

      // only creators and super admin can edit
      if (user.role === "group-admin" && group.creator !== user.username) {
        return res.status(404).json({
          error: "PUT/api/group/:id = Not allowed to edit this group",
        });
      }

      const { name, members, requests } = req.body || {};

      const updated_group = new Group(
        group.id,
        name,
        group.creator,
        members,
        requests
      );

      groups[index] = updated_group;

      writeJson(group_path, groups);
      return res.json(updated_group);
    });

    // delete a group
    app.delete("/api/group/:id", attachUser, (req, res) => {
      const user = req.user;

      const groups = readJson(group_path) ?? [];
      const channels = readJson(channel_path) ?? [];
      const { id } = req.params;

      const group = groups.find((g) => g.id === id);
      if (!group) {
        return res.status(404).json({
          error: "DELETE/api/group/:id = Group not found in database",
        });
      }

      // only creators and super admin can edit/delete
      if (user.role === "group-admin" && group.creator !== user.username) {
        return res.status(404).json({
          error: "DELETE/api/group/:id = Not allowed to edit this group",
        });
      }

      // remove all channels belonging to this group
      const remaining_channels = [];
      for (let i = 0; i < channels.length; i++) {
        const ch = channels[i];
        if (ch && ch.group_id !== id) {
          remaining_channels.push(ch);
        }
      }
      writeJson(channel_path, remaining_channels);

      // remove the group
      const deleted_group = group.name;
      groups.splice(groups.indexOf(group), 1);
      writeJson(group_path, groups);
      return res.json({ deleted: deleted_group });
    });

    app.delete("/api/group/:id/member", attachUser, (req, res) => {
      const user = req.user;

      const groups = readJson(group_path) ?? [];
      const channels = readJson(channel_path) ?? [];
      const { id } = req.params;

      const username = user.username;
      const group_index = groups.findIndex((g) => g.id === id);
      const group = groups[group_index];
      if (!group) {
        return res.status(404).json({
          error: "DELETE/api/group/:id/member = Group not found in database",
        });
      }
      // remove from group member
      group.members = group.members.filter((m) => m !== username);
      groups[group_index] = group;

      // remove from channel users and banned users
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        // remove only from the group's channels
        if (channel.group_id !== id) continue;

        // remove from all channels in the group
        channel.channel_users = channel.channel_users.filter(
          (ch_u) => ch_u !== username
        );
        channel.banned_users = channel.banned_users.filter(
          (b_u) => b_u !== username
        );
        // replace the edited group
        channels[i] = channel;
      }

      // save it in the Json
      writeJson(group_path, groups);
      writeJson(channel_path, channels);
      return res.json({ removed: username, group_id: id });
    });

    app.patch("/api/group/:id/request", attachUser, (req, res) => {
      const user = req.user;
      if (!user)
        return res.status(401).json({
          error: "PATCH/api/group/:id/request = No user",
        });

      const groups = readJson(group_path) ?? [];

      const id = req.params.id;
      const group_index = groups.findIndex((g) => g.id === id);
      if (group_index === -1) {
        return res.status(404).json({
          error: "PATCH/api/group/:id/request = Group not found in database",
        });
      }
      const group = groups[group_index];
      const username = user.username;

      // dont allow request if already a member
      if (group.members.includes(username)) {
        return res.status(400).json({
          error: "PATCH/api/group/:id/request = Already a member of this group",
        });
      }

      // dont allow request again if already requested
      if (group.requests.includes(username)) {
        return res.json(group);
      }

      group.requests.push(username);
      groups[group_index] = group;
      writeJson(group_path, groups);
      return res.json(username);
    });
  },
};
