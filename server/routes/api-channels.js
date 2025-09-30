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
      // 1) load group by id
      const group = await db.collection("group").findOne({ id: group_id });
      if (!group) {
        return res.status(404).json({
          error:
            "GET/api/groups/:group_id/channels = Group not found in database",
        });
      }
      // 2) check permission
      if (!canListChannel(req.user, group)) {
        return res
          .status(404)
          .json({ error: "GET/api/groups/:group_id/channels = No permission" });
      }
      // 3) get channels for the group and return
      const channels = await db
        .collection("channel")
        .find({ group_id: group_id })
        .toArray();
      return res.json(channels);
    } catch (e) {
      console.log("GET/api/groups/:group_id/channels = ", e);
      return res.status(500).json({
        error: "GET/api/groups/:group_id/channels = Failed to load channels",
      });
    }
  });

  // create channel
  app.post("/api/channel/:id", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const { id } = req.params; // group id
      const { name } = req.body || {};
      // 1) check if channel name exist
      if (!name) {
        return res.status(404).json({
          error: "POST/api/channel/:id = Channel name required",
        });
      }
      // 2) load group by id
      const group = await db.collection("group").findOne({ id: id });
      if (!group) {
        return res.status(404).json({
          error: "POST/api/channel/:id = Group not found",
        });
      }
      // 3) check permission
      if (!canManangeChannel(req.user, group)) {
        return res.status(404).json({
          error:
            "POST/api/channel/:id = Only super and creator are allowed to create groups",
        });
      }
      // 4) get last channel to get the id incrementation
      const last_id = await db
        .collection("channel")
        .find({})
        .sort({ _id: -1 })
        .limit(1)
        .next();
      const next_id = last_id
        ? String(parseInt(last_id.id, 10) + 1)
        : "1";
      // 5) save it to mongo db
      const new_channel = {
        id: String(next_id),
        name: String(name),
        group_id: String(id),
        banned_users: [],
        channel_users: [],
      };
      await db.collection("channel").insertOne({ ...new_channel });
      return res.json(new_channel);
    } catch (e) {
      console.log("POST/api/channel/:id = ", e);
      return res
        .status(500)
        .json({ error: "POST/api/channel/:id = Failed to create channel" });
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
      // 1) load channel by id
      const channel = await db
        .collection("channel")
        .findOne({ id: channel_id });
      if (!channel) {
        return res
          .status(404)
          .json({ error: "Delete/api/channel/:id = Channel not found" });
      }
      // 2) load group by id
      const group = await db
        .collection("group")
        .findOne({ id: channel.group_id });
      if (!group) {
        return res.status(404).json({
          error:
            "Delete/api/channel/:id = Group not found while deleting channel",
        });
      }
      // 3) check permission
      if (!canManangeChannel(req.user, group)) {
        return res.status(404).json({
          error:
            "Delete/api/channel/:id = Only super and creator are allowed to delete channels",
        });
      }
      // 4) delete channel from mongo db
      await db.collection("channel").deleteOne({ id: channel_id });
      return res.json({ deleted: channel_id });
    } catch (e) {
      console.log("Delete/api/channel/:id = ", e);
      return res
        .status(500)
        .json({ error: "Delete/api/channel/:id = Failed to delete channel" });
    }
  });
}
