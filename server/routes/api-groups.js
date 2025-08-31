/*  Routes
  /api/groups
  /api/search/groups
*/
module.exports = {
  route: async (app) => {
    const { readJson } = require("../db-manager.js");
    const user_path = "../data/user.json";
    const group_path = "../data/group.json";
    
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

    // ____________ GROUPS ____________
    // list groups api call
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

    // list all groups for searching
    app.get("/api/search/groups", attachUser, (req, res) => {
      const groups = readJson(group_path) ?? [];
      const user = req.user;
      if (!user) return res.status(401).json({ error: "No user found" });

      const raw_groups = groups;

      // only send necessary group info
      const mapped_groups = raw_groups.map((group) => ({
        id: group.id,
        name: group.name,
        creator: group.creator,
        isAdmin: group.creator === user.username,
        isMember: group.members.includes(user.username),
        channelCount: group.channels.length,
        memberCount: group.members.length,
      }));

      return res.json(mapped_groups);
    });
  },
};
