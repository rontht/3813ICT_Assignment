/*  Routes
  /api/groups
  /api/search/groups
*/
module.exports = {
  route: async (app) => {
    const attachUser = require("./attachUser");
    const { readJson } = require("../db-manager.js");

    const groups = await readJson("../data/group.json");

    // ____________ GROUPS ____________
    // list groups api call
    app.get("/api/groups", attachUser, (req, res) => {
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
