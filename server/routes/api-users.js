/*  Routes
    /api/groups/:group_id/members
    /api/users
*/
module.exports = {
  route: async (app) => {
    const attachUser = require('./attachUser');
    const { groups, users } = require('../mock');

    // ____________ USERS ____________
    // list users api call for specific group
    app.get("/api/groups/:group_id/members", attachUser, (req, res) => {
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

    // list all users for super admins
    app.get("/api/users", attachUser, (req, res) => {
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
