/*  Routes
  GET /api/groups/:group_id/channels
  POST/api/channel/:id
  DELETE/api/channel/:id
*/

import Channel from "../models/channel.js";
import { getDB } from "../db.js";
import { attachUser, canListChannel, canManangeChannel } from "./helpers.js";

export function route(app) {
  // ____________ CHANNELS ____________
  // list channels api call
  app.get("/api/groups/:group_id/channels", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const { group_id } = req.params;

      const group = await db.collection("group").find({ id: group_id });

      if (!group) {
        return res.status(404).json({
          error:
            "GET/api/groups/:group_id/channels = Group not found in database",
        });
      }

      if (!canListChannel(req.user, group)) {
        return res
          .status(404)
          .json({ error: "GET/api/groups/:group_id/channels = No permission" });
      }

      const channels = await db
        .collection("channel")
        .find({ group_id: group_id })
        .toArray();

      return res.json(channels);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Failed to load channels" });
    }
  });

  // create channel
  app.post("/api/channel/:id", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const { id } = req.params; // group id
      const { name } = req.body || {};

      if (!name) {
        return res
          .status(404)
          .json({ error: "POST/api/channel/:id = Channel name required" });
      }

      const group = await db.collection("group").find({ id: id });
      if (!group) {
        return res
          .status(404)
          .json({ error: "POST/api/channel/:id = Group not found" });
      }

      if (!canManangeChannel(req.user, group)) {
        return res.status(404).json({
          error:
            "POST/api/channel/:id = Only super and creator are allowed to create groups",
        });
      }

      const last_channel = await db
        .collection("channel")
        .find({ group_id: id })
        .sort({ id: -1 })
        .limit(1)
        .next();

      let channel_id;
      if (last_channel?.id) {
        const last_num = parseInt(last_channel.id.replace(/^c/, ""), 10);
        const next_num = last_num + 1;
        channel_id = "c" + next_num.toString().padStart(3, "0");
      } else {
        channel_id = "c001";
      }

      const banned_users = [];
      const new_channel = new Channel(channel_id, name, id, banned_users);
      if (!new_channel.channel_users) new_channel.channel_users = [];

      await db.collection("channel").insertOne({ ...new_channel });

      return res.json(new_channel);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Failed to create channel" });
    }
  });

  // delete channel
  app.delete("/api/channel/:id", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const { id: channel_id } = req.params;
      if (!channel_id) {
        return res
          .status(404)
          .json({ error: "Delete/api/channel/:id = Channel id required" });
      }

      const channel = await db
        .collection("channel")
        .findOne({ id: channel_id });
      if (!channel) {
        return res
          .status(404)
          .json({ error: "Delete/api/channel/:id = Channel not found" });
      }

      const group = await db
        .collection("group")
        .findOne({ id: channel.group_id });
      if (!group) {
        return res.status(404).json({
          error:
            "Delete/api/channel/:id = Group not found while deleting channel",
        });
      }

      if (!canManangeChannel(req.user, group)) {
        return res.status(404).json({
          error:
            "Delete/api/channel/:id = Only super and creator are allowed to delete channels",
        });
      }

      await db.collection("channel").deleteOne({ id: channel_id });
      return res.json({ deleted: channel_id });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Failed to delete channel" });
    }
  });
}
