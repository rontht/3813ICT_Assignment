/*  Routes
    /
    /api/auth
*/
module.exports = {
  route: async (app) => {
    const { users } = require("../mock");

    // ____________ DEBUG ____________
    // route to display all users for testing
    app.get("/", (req, res) => {
      res.json({ users, groups, channels });
    });

    // ____________ AUTH ____________
    // auth api call
    app.post("/api/auth", (req, res) => {
      const { email, password } = req.body;

      // find a matching user
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) {
        return res.json({ valid: false });
      }

      user.valid = true;
      return res.json(user);
    });
  },
};
