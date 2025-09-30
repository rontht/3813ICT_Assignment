/*  Routes
    GET /
    POST /api/auth
    POST /api/auth/register
*/
import User from "../models/user.js";
import { getDB } from "../db.js";

export function route(app) {
  // ____________ DEBUG ____________
  // route to display all data for testing
  app.get("/", async (req, res) => {
    try {
      const db = getDB();
      const users = await db
        .collection("user")
        .find({})
        .project({ password: 0 })
        .toArray();
      const groups = await db.collection("group").find({}).toArray();
      const channels = await db.collection("channel").find({}).toArray();
      res.json({ users, groups, channels });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Failed to load data for localhost:3000" });
    }
  });

  // ____________ AUTH ____________
  // auth api call
  app.post("/api/auth", async (req, res) => {
    try {
      const db = getDB();
      const { username, password } = req.body || {};

      const user = await db.collection("user").findOne({ username, password });
      if (!user) return res.json({ valid: false });
      return res.json({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        valid: true,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // register api call
  app.post("/api/auth/register", async (req, res) => {
    try {
      const db = getDB();
      const { username, name, email, role, password } = req.body || {};
      
      // check if any missing
      if (!username || !name || !email || !role || !password) {
        return res.status(400).json({ error: "Missing fields" });
      }
      
      // check if username or email already exist
      const existing = await db.collection("user").findOne({
        $or: [{ username }, { email }],
      });
      if (existing) {
        if (existing.username === username) {
          return res.status(409).json({ error: "Username already exists" });
        }
        return res.status(409).json({ error: "Email already exists" });
      }

      // fill into user model and insert
      const new_user = new User(username, name, email, password, role);
      await db.collection("user").insertOne({ ...new_user });

      return res.json({
        username: new_user.username,
        name: new_user.name,
        email: new_user.email,
        role: new_user.role,
        valid: true,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Registeration failed" });
    }
  });
}
