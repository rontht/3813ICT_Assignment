/*  Routes
    GET /
    POST /api/auth
    POST /api/auth/register
    GET /api/user
*/
import User from "../models/user.js";
import { getDB } from "../db.js";
import { attachUser } from "./helpers.js";

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
      if (!username) {
        return res
          .status(400)
          .json({ error: "Please enter a valid username." });
      }
      if (!password) {
        return res
          .status(400)
          .json({ error: "Please enter a valid password." });
      }
      const user = await db.collection("user").findOne({ username, password });
      if (!user) {
        return res.status(400).json({
          error:
            "The email or password you entered doesn't match our records. Please double-check and try again",
        });
      }
      return res.json({
        username: user.username,
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
        return res
          .status(400)
          .json({ error: "Please fill in all the fields to sign up." });
      }

      if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/.test(email)) {
        return res
          .status(400)
          .json({ error: "Please enter a valid email address." });
      }

      // check if username or email already exist
      const existing = await db.collection("user").findOne({
        $or: [{ username }, { email }],
      });
      if (existing) {
        if (existing.username === username) {
          return res.status(409).json({
            error: "This username already exists. Please choose a new one.",
          });
        }
        return res.status(409).json({
          error: "This email already in used. Please choose a new one.",
        });
      }

      // fill into user model and insert
      const new_user = new User(username, name, email, password, role, "");
      await db.collection("user").insertOne({ ...new_user });

      return res.json({
        username: new_user.username,
        valid: true,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Registeration failed" });
    }
  });

  // get current user data
  app.get("/api/user", attachUser, async (req, res) => {
    try {
      const user = req.user;
      return res.json(user);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "GET current user info failed" });
    }
  });
}
