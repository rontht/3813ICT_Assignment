/*  Routes
    /api/groups/:group_id/channels
*/
module.exports = {
  route: async (app) => {
    const attachUser = require('./attachUser');
    const { groups, channels } = require('../mock');

    // ____________ CHANNELS ____________
    // list channels api call
    app.get("/api/groups/:group_id/channels", attachUser, (req, res) => {
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
  },
};
