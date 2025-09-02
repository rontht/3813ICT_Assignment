/*  Routes
    GET /api/groups/:group_id/members
    GET /api/groups/:group_id/requests
    GET /api/channels/:channel_id/banned
    GET /api/channels/:channel_id/members
    GET /api/users
    DELETE /api/channel/:channel_id/members/:username
    PUT /api/channel/:channel_id/bans/:username
    PUT /api/channel/:channel_id/members/:username
*/
module.exports = {
  route: async (app) => {
    const { readJson, writeJson } = require("../db-manager.js");
    const user_path = "../data/user.json";
    const group_path = "../data/group.json";
    const channel_path = "../data/channel.json";

    function attachUser(req, res, next) {
      const users = readJson(user_path) ?? [];

      // get id from header
      const username = req.header("username");

      if (!username) {
        return res.status(404).json({ error: "api-user.js: User not found in header." });
      }

      // find user
      const user = users.find((u) => u.username === username) || null;
      if (!user) {
        return res.status(404).json({ error: "api-user.js: User not found in database." });
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
        return res.status(404).json({ error: "GET/api/groups/:group_id/members = Group not found in database" });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res.status(404).json({ error: "GET/api/groups/:group_id/members = No permission" });
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
        return res.status(404).json({ error: "GET/api/groups/:group_id/requests = Group not found in database" });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res.status(404).json({ error: "GET/api/groups/:group_id/requests = No permission" });
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
        return res.status(404).json({ error: "GET/api/channels/:channel_id/banned = Channel not found in database" });
      }

      // find the group
      const group = groups.find((g) => g.id === channel.group_id);
      if (!group) {
        return res.status(404).json({ error: "GET/api/channels/:channel_id/banned = Group not found in database" });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res.status(404).json({ error: "GET/api/channels/:channel_id/banned = No permission" });
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

    // list channel users api call for specific channel
    app.get("/api/channels/:channel_id/members", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
      const { channel_id } = req.params;

      // find the channel
      const channel = channels.find((g) => g.id === channel_id);
      if (!channel) {
        return res.status(404).json({ error: "GET/api/channels/:channel_id/members = Channel not found in database" });
      }

      // find the group
      const group = groups.find((g) => g.id === channel.group_id);
      if (!group) {
        return res.status(404).json({ error: "GET/api/channels/:channel_id/members = Group not found in database" });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res.status(404).json({ error: "GET/api/channels/:channel_id/members = No permission" });
      }

      // don't sent all info of users
      // send only what's necessary
      const channel_users = channel.channel_users
        .map((username) => users.find((user) => user.username === username))
        .map((user) => ({
          username: user.username,
          name: user.name,
          role: user.role,
        }));

      return res.json(channel_users);
    });

    // list all users for super admins
    app.get("/api/users", attachUser, (req, res) => {
      const users = readJson(user_path) ?? [];
      const user = req.user;
      if (!user) return res.status(401).json({ error: "GET/api/users = not auth" });
      if (user.role !== "super-admin")
        return res.status(403).json({ error: "GET/api/users = not permission" });

      return res.json(
        users.map((user) => ({
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        }))
      );
    });

    // remove user from channel_users
    app.delete(
      "/api/channel/:channel_id/members/:username",
      attachUser,
      (req, res) => {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "DELETE/api/channel/:channel_id/members/:username = No user" });

        const channels = readJson(channel_path) ?? [];
        const groups = readJson(group_path) ?? [];

        const channel_id = req.params.channel_id;
        const username = req.params.username;
        if (!channel_id || !username)
          return res.status(404).json({ error: "DELETE/api/channel/:channel_id/members/:username = Bad parameters" });

        // find the channel
        const channel = channels.find((g) => g.id === channel_id);
        if (!channel) {
          return res
            .status(404)
            .json({ error: "DELETE/api/channel/:channel_id/members/:username = Channel not found in database" });
        }

        // check permission
        const group = groups.find((g) => g.id === channel.group_id);
        if (!group) {
          return res.status(404).json({ error: "DELETE/api/channel/:channel_id/members/:username = Group not found in database" });
        }
        // only creators and super admin can edit
        if (user.role === "group-admin" && group.creator !== user.username) {
          return res
            .status(404)
            .json({ error: "DELETE/api/channel/:channel_id/members/:username = Not allowed to edit this group" });
        }

        // remove user from channel_users
        channel.channel_users = channel.channel_users || [];
        for (let i = 0; i < channel.channel_users.length; i++) {
          if (channel.channel_users[i] === username) {
            channel.channel_users.splice(i, 1);
            break;
          }
        }

        writeJson(channel_path, channels);
        return res.json(channel);
      }
    );

    // add user to banned_users (also remove from channel_users if present)
    app.put(
      "/api/channel/:channel_id/bans/:username",
      attachUser,
      (req, res) => {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "PUT/api/channel/:channel_id/bans/:username = No user" });

        const channels = readJson(channel_path) ?? [];
        const groups = readJson(group_path) ?? [];

        const channel_id = req.params.channel_id;
        const username = req.params.username;
        if (!channel_id || !username)
          return res.status(404).json({ error: "PUT/api/channel/:channel_id/bans/:username = Bad parameters" });

        // find the channel
        const channel = channels.find((g) => g.id === channel_id);
        if (!channel) {
          return res
            .status(404)
            .json({ error: "PUT/api/channel/:channel_id/bans/:username = Channel not found in database" });
        }

        // check permission
        const group = groups.find((g) => g.id === channel.group_id);
        if (!group) {
          return res.status(404).json({ error: "PUT/api/channel/:channel_id/bans/:username = Group not found in database" });
        }
        // only creators and super admin can edit
        if (user.role === "group-admin" && group.creator !== user.username) {
          return res
            .status(404)
            .json({ error: "PUT/api/channel/:channel_id/bans/:username = Not allowed to edit this group" });
        }

        // ensure username is a group member
        let is_group_member = false;
        const gm = group.members || [];
        for (let i = 0; i < gm.length; i++)
          if (gm[i] === username) {
            is_group_member = true;
            break;
          }
        if (!is_group_member)
          return res.status(409).json({ error: "PUT/api/channel/:channel_id/bans/:username = User not in group" });

        // remove from channel_users if present
        channel.channel_users = channel.channel_users || [];
        for (let i = 0; i < channel.channel_users.length; i++) {
          if (channel.channel_users[i] === username) {
            channel.channel_users.splice(i, 1);
            break;
          }
        }

        // add to banned_users if not present
        channel.banned_users = channel.banned_users || [];
        let already_banned = false;
        for (let i = 0; i < channel.banned_users.length; i++) {
          if (channel.banned_users[i] === username) {
            already_banned = true;
            break;
          }
        }
        if (!already_banned) channel.banned_users.push(username);

        writeJson(channel_path, channels);
        return res.json(channel);
      }
    );

    // add user to channel_users and remove from banned_users
    app.put(
      "/api/channel/:channel_id/members/:username",
      attachUser,
      (req, res) => {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "PUT/api/channel/:channel_id/members/:username = No user" });

        const channels = readJson(channel_path) ?? [];
        const groups = readJson(group_path) ?? [];

        const channel_id = req.params.channel_id;
        const username = req.params.username;
        if (!channel_id || !username)
          return res.status(404).json({ error: "PUT/api/channel/:channel_id/members/:username = bad parameters" });

        // find the channel
        const channel = channels.find((g) => g.id === channel_id);
        if (!channel) {
          return res
            .status(404)
            .json({ error: "PUT/api/channel/:channel_id/members/:username = Channel not found in database" });
        }

        // check permission
        const group = groups.find((g) => g.id === channel.group_id);
        if (!group) {
          return res.status(404).json({ error: "PUT/api/channel/:channel_id/members/:username = Group not found in database" });
        }
        // only creators and super admin can edit
        if (user.role === "group-admin" && group.creator !== user.username) {
          return res
            .status(404)
            .json({ error: "PUT/api/channel/:channel_id/members/:username = Not allowed to edit this group" });
        }

        // must be a group member to join channel
        let is_group_member = false;
        const gm = group.members || [];
        for (let i = 0; i < gm.length; i++)
          if (gm[i] === username) {
            is_group_member = true;
            break;
          }
        if (!is_group_member)
          return res.status(409).json({ error: "PUT/api/channel/:channel_id/members/:username = User not in group" });

        // remove from banned_users if present
        channel.banned_users = channel.banned_users || [];
        for (let i = 0; i < channel.banned_users.length; i++) {
          if (channel.banned_users[i] === username) {
            channel.banned_users.splice(i, 1);
            break;
          }
        }

        // add to channel_users if not present
        channel.channel_users = channel.channel_users || [];
        let already_member = false;
        for (let i = 0; i < channel.channel_users.length; i++) {
          if (channel.channel_users[i] === username) {
            already_member = true;
            break;
          }
        }
        if (!already_member) channel.channel_users.push(username);
        writeJson(channel_path, channels);
        return res.json(channel);
      }
    );
  },
};
