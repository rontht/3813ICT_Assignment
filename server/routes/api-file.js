import { uploadChat, uploadAvatar } from "../functions/file.js";
import { getDB } from "../db.js";
import { attachUser } from "./helpers.js";
import express from "express";
import path from "path";

export function route(app) {
  app.post("/api/upload/chat", uploadChat.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }
      const url = `${req.protocol}://${req.get("host")}/uploads/chat/${
        req.file.filename
      }`;
      res.json({ success: true, url });
    } catch (e) {
      console.error("Upload failed:", e);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  });

  app.post(
    "/api/upload/avatar",
    uploadAvatar.single("image"),
    attachUser,
    async (req, res) => {
      try {
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, error: "No file uploaded" });
        }
        const url = `${req.protocol}://${req.get("host")}/uploads/avatar/${
          req.file.filename
        }`;
        const db = getDB();
        const user = req.user;
        await db
          .collection("user")
          .updateOne({ username: user.username }, { $set: { avatar: url } });
        res.json({ success: true, url });
      } catch (e) {
        console.error("Avatar upload failed:", e);
        res.status(500).json({ success: false, error: "Upload failed" });
      }
    }
  );

  app.get("/api/gifs", (req, res) => {
    try {
      const files = [
        "1.gif",
        "2.gif",
        "3.gif",
        "4.gif",
        "5.gif",
        "6.gif",
        "7.gif",
        "8.gif",
        "9.gif",
        "10.gif",
      ];
      const baseUrl = `${req.protocol}://${req.get("host")}/uploads/gif/`;
      const gifUrls = files.map((f) => baseUrl + f);
      res.json(gifUrls);
    } catch (e) {
      console.error("Get Gifs failed:", e);
      res.status(500).json({ success: false, error: "Get Gifs failed" });
    }
  });

  app.get("/api/user/:username/chat", async (req, res) => {
    try {
      const db = getDB();
      const username = req.params.username;
      const user_info = await db
        .collection("user")
        .findOne(
          { username: username },
          { projection: { _id: 0, name: 1, avatar: 1 } }
        );
      res.json({ avatar: user_info.avatar, name: user_info.name });
    } catch (e) {
      console.error("Get Chat User Info failed:", e);
      res
        .status(500)
        .json({ success: false, error: "Get Chat User Info failed" });
    }
  });

  app.use(
    "/uploads/chat",
    express.static(path.join(process.cwd(), "uploads/chat"))
  );

  app.use(
    "/uploads/avatar",
    express.static(path.join(process.cwd(), "uploads/avatar"))
  );

  app.use(
    "/uploads/gif",
    express.static(path.join(process.cwd(), "uploads/gif"))
  );
}
