/*  Routes
    GET /api/groups/:group_id/members
    GET /api/groups/:group_id/requests
    GET /api/channels/:channel_id/banned
    GET /api/channels/:channel_id/members
    GET /api/users
    DELETE /api/channel/:channel_id/members/:username
    PUT /api/channel/:channel_id/bans/:username
    PUT /api/channel/:channel_id/members/:username
    DELETE /api/user/:username
    PATCH /api/user/:username/role
    GET /api/log
*/
module.exports = {
  route: async (app) => {
    const { readJson, writeJson } = require("../db-manager.js");
    const log_path = "../data/log.txt";
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
          .json({ error: "api-user.js: User not found in header." });
      }

      // find user
      const user = users.find((u) => u.username === username) || null;
      if (!user) {
        return res
          .status(404)
          .json({ error: "api-user.js: User not found in database." });
      }

      // attach it to request
      req.user = user;
      next();
    }

    // ____________ USERS ____________
    // get all members from a group
    app.get("/api/groups/:group_id/members", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
      const { group_id } = req.params;

      // find the group
      const group = groups.find((g) => g.id === group_id);
      if (!group) {
        return res.status(404).json({
          error:
            "GET/api/groups/:group_id/members = Group not found in database",
        });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res
          .status(404)
          .json({ error: "GET/api/groups/:group_id/members = No permission" });
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

    // get all requested members from a group
    app.get("/api/groups/:group_id/requests", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
      const { group_id } = req.params;

      // find the group
      const group = groups.find((g) => g.id === group_id);
      if (!group) {
        return res.status(404).json({
          error:
            "GET/api/groups/:group_id/requests = Group not found in database",
        });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res
          .status(404)
          .json({ error: "GET/api/groups/:group_id/requests = No permission" });
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

    // get all banned members from a group
    app.get("/api/channels/:channel_id/banned", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
      const { channel_id } = req.params;

      // find the channel
      const channel = channels.find((g) => g.id === channel_id);
      if (!channel) {
        return res.status(404).json({
          error:
            "GET/api/channels/:channel_id/banned = Channel not found in database",
        });
      }

      // find the group
      const group = groups.find((g) => g.id === channel.group_id);
      if (!group) {
        return res.status(404).json({
          error:
            "GET/api/channels/:channel_id/banned = Group not found in database",
        });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res.status(404).json({
          error: "GET/api/channels/:channel_id/banned = No permission",
        });
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

    // get all channel members from a channel
    app.get("/api/channels/:channel_id/members", attachUser, (req, res) => {
      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];
      const { channel_id } = req.params;

      // find the channel
      const channel = channels.find((g) => g.id === channel_id);
      if (!channel) {
        return res.status(404).json({
          error:
            "GET/api/channels/:channel_id/members = Channel not found in database",
        });
      }

      // find the group
      const group = groups.find((g) => g.id === channel.group_id);
      if (!group) {
        return res.status(404).json({
          error:
            "GET/api/channels/:channel_id/members = Group not found in database",
        });
      }

      // check for permission
      const user = req.user;
      const isSuper = user.role === "super-admin";
      const isMember = group.members.includes(user.username);
      if (!isSuper && !isMember) {
        return res.status(404).json({
          error: "GET/api/channels/:channel_id/members = No permission",
        });
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

    // get all users in the system for admins
    app.get("/api/users", attachUser, (req, res) => {
      const users = readJson(user_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const user = req.user;
      if (!user)
        return res.status(401).json({ error: "GET/api/users = not auth" });

      const is_super = user.role === "super-admin";
      const is_creator = groups.some((g) => g.creator === user.username);

      if (!is_super && !is_creator)
        return res
          .status(403)
          .json({ error: "GET/api/users = not permission" });

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
        if (!user)
          return res.status(401).json({
            error: "DELETE/api/channel/:channel_id/members/:username = No user",
          });

        const channels = readJson(channel_path) ?? [];
        const groups = readJson(group_path) ?? [];

        const channel_id = req.params.channel_id;
        const username = req.params.username;
        if (!channel_id || !username)
          return res.status(404).json({
            error:
              "DELETE/api/channel/:channel_id/members/:username = Bad parameters",
          });

        // find the channel
        const channel = channels.find((g) => g.id === channel_id);
        if (!channel) {
          return res.status(404).json({
            error:
              "DELETE/api/channel/:channel_id/members/:username = Channel not found in database",
          });
        }

        // check permission
        const group = groups.find((g) => g.id === channel.group_id);
        if (!group) {
          return res.status(404).json({
            error:
              "DELETE/api/channel/:channel_id/members/:username = Group not found in database",
          });
        }
        // only creators and super admin can edit
        if (!(user.role === "super-admin" || group.creator === user.username)) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = Not allowed to delete in this group",
          });
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
        if (!user)
          return res.status(401).json({
            error: "PUT/api/channel/:channel_id/bans/:username = No user",
          });

        const channels = readJson(channel_path) ?? [];
        const groups = readJson(group_path) ?? [];

        const channel_id = req.params.channel_id;
        const username = req.params.username;
        if (!channel_id || !username)
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = Bad parameters",
          });

        // find the channel
        const channel = channels.find((g) => g.id === channel_id);
        if (!channel) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = Channel not found in database",
          });
        }

        // check permission
        const group = groups.find((g) => g.id === channel.group_id);
        if (!group) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = Group not found in database",
          });
        }
        // only creators and super admin can edit
        if (!(user.role === "super-admin" || group.creator === user.username)) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = Not allowed to edit this group",
          });
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
          return res.status(409).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = User not in group",
          });

        // remove from channel_users if present
        channel.channel_users = channel.channel_users || [];
        for (let i = 0; i < channel.channel_users.length; i++) {
          if (channel.channel_users[i] === username) {
            channel.channel_users.splice(i, 1);
            break;
          }
        }

        // add to banned_users if not pre xsent
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

        // write log after successful ban
        const date = new Date().toISOString();
        const line = `[${date}] ${user.username} banned ${username} from channel ${channel.name}(${channel.id}) in group ${group.name} (${group.id}).`;
        const logs = readJson(log_path) ?? [];
        logs.push(line);
        writeJson(log_path, logs);

        return res.json(channel);
      }
    );

    // add user to channel_users and remove from banned_users
    app.put(
      "/api/channel/:channel_id/members/:username",
      attachUser,
      (req, res) => {
        const user = req.user;
        if (!user)
          return res.status(401).json({
            error: "PUT/api/channel/:channel_id/members/:username = No user",
          });

        const channels = readJson(channel_path) ?? [];
        const groups = readJson(group_path) ?? [];

        const channel_id = req.params.channel_id;
        const username = req.params.username;
        if (!channel_id || !username)
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/members/:username = bad parameters",
          });

        // find the channel
        const channel = channels.find((g) => g.id === channel_id);
        if (!channel) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/members/:username = Channel not found in database",
          });
        }

        // check permission
        const group = groups.find((g) => g.id === channel.group_id);
        if (!group) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/members/:username = Group not found in database",
          });
        }
        // only creators and super admin can edit
        if (!(user.role === "super-admin" || group.creator === user.username)) {
          return res.status(404).json({
            error:
              "PUT/api/channel/:channel_id/bans/:username = Not allowed to edit this group",
          });
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
          return res.status(409).json({
            error:
              "PUT/api/channel/:channel_id/members/:username = User not in group",
          });

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

    // delete user from database
    app.delete("/api/user/:username", attachUser, (req, res) => {
      const user = req.user;
      if (!user)
        return res.status(401).json({
          error: "DELETE/api/user/:username = No user",
        });

      const channels = readJson(channel_path) ?? [];
      const groups = readJson(group_path) ?? [];
      const users = readJson(user_path) ?? [];

      const username = req.params.username;
      const target_user = users.find((u) => u.username === username);
      const target_index = users.findIndex((u) => u.username === username);
      const super_admin = users.find((u) => u.role === "super-admin");

      // users can delete themselves
      if (user.username !== username) {
        // only super admin can delete others
        if (user.role !== "super-admin") {
          return res.status(404).json({
            error: "DELETE/api/user/:username = Not allowed to delete users",
          });
        }
      }

      if (target_user.role === "super-admin") {
        return res.status(404).json({
          error: "DELETE/api/user/:username = Super Admins cannot be deleted",
        });
      }

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        // remove from all groups they belong to
        group.members = group.members.filter((m) => m !== target_user.username);
        group.requests = group.requests.filter(
          (r) => r !== target_user.username
        );
        // reassign creator to the first super_admin
        if (group.creator === target_user.username) {
          group.creator = super_admin.creator;
        }
        // replace the edited group
        groups[i] = group;
      }

      for (let j = 0; j < channels.length; j++) {
        const channel = channels[j];
        // remove from all channels they belong to
        channel.channel_users = channel.channel_users.filter(
          (b) => b !== target_user.username
        );
        channel.banned_users = channel.banned_users.filter(
          (b) => b !== target_user.username
        );
        // replace the edited group
        channels[j] = channel;
      }

      // finally, remove the user from users
      if (target_index !== -1) {
        users.splice(target_index, 1);
      }

      // save the changes
      writeJson(group_path, groups);
      writeJson(channel_path, channels);
      writeJson(user_path, users);

      return res.json({ deleted: username });
    });

    // promote user to next
    app.patch("/api/user/:username/role", attachUser, (req, res) => {
      const user = req.user;
      if (!user)
        return res.status(401).json({
          error: "PATCH/api/user/:username/role = No user",
        });

      const users = readJson(user_path) ?? [];
      const username = req.params.username;
      const target_role = req.body.role || "user";
      const target_user = users.find((u) => u.username === username);
      const target_index = users.findIndex((u) => u.username === username);

      if (!target_user) {
        return res.status(404).json({
          error: "PATCH/api/user/:username/role = Target user not found",
        });
      }

      // users cannot promote themselves
      if (user.username === target_user.username) {
        return res.status(404).json({
          error:
            "PATCH/api/user/:username/role = You cannot promote your own role",
        });
      }
      // only super admins can promote others
      if (user.role !== "super-admin") {
        return res.status(404).json({
          error: "PATCH/api/user/:username/role = Not allowed to promote roles",
        });
      }
      // cannot promote your own role
      if (user.username === target_user.username) {
        return res.status(403).json({
          error:
            "PATCH/api/user/:username/role = You cannot promote your own role",
        });
      }

      // to enforce promote only
      const rank = { user: 0, "group-admin": 1, "super-admin": 2 };
      const current = target_user.role in rank ? target_user.role : "user";
      const next = target_role;
      if (rank[next] < rank[current]) {
        return res.status(400).json({
          error: "PATCH/api/user/:username/role = no demoting allowed",
        });
      }

      // if already the same
      if (rank[next] === rank[current]) {
        return res.json(target_user);
      }

      // make it permanent
      target_user.role = next;
      users[target_index] = target_user;
      writeJson(user_path, users);
      return res.json(users[target_index]);
    });

    app.get("/api/log", attachUser, (req, res) => {
      const user = req.user;
      if (!user)
        return res.status(401).json({
          error: "GET/api/log = No user",
        });

      // only super can see the log
      if (user.role !== "super-admin") {
        return res.status(404).json({
          error: "GET/api/log = Not allowed to see logs",
        });
      }

      const logs = readJson(log_path) ?? [];

      return res.json(logs);
    });
  },
};
