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

  app.use(
    "/uploads/chat",
    express.static(path.join(process.cwd(), "uploads/chat"))
  );
  app.use(
    "/uploads/avatar",
    express.static(path.join(process.cwd(), "uploads/avatar"))
  );
}
