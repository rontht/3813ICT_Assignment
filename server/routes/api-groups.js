/*  Routes
  GET /api/groups
  GET /api/group/:id
  GET /api/search/groups
  POST /api/group/create
  PUT /api/group/:id
  DELETE /api/group/:id
  DELETE /api/group/:id/member
  PATCH /api/group/:id/request
*/

import { getDB } from "../db.js";
import Group from "../models/group.js";
import {
  attachUser,
  isGroupMember,
  isSuper,
  canManageGroup,
  canCreateGroup,
} from "./helpers.js";

export function route(app) {
  // ____________ GROUPS ____________
  // get all groups for super
  app.get("/api/groups", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const user = req.user;
      // 1) check for permission. if super, get all group
      if (isSuper(user)) {
        const all_groups = await db.collection("group").find({}).toArray();
        return res.json(all_groups);
      }
      // 2) else, filter groups accordingly
      const filter = {
        $or: [{ creator: user.username }, { members: user.username }],
      };
      const filtered_groups = await db
        .collection("group")
        .find(filter)
        .toArray();
      return res.json(filtered_groups);
    } catch (e) {
      console.log("GET/api/groups = ", e);
      return res.status(500).json({
        error: "GET/api/groups = Failed to load groups",
      });
    }
  });

  // get all info of a group for editing
  app.get("/api/group/:id", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const id = req.params.id;
      // 1) get one group filter by id
      const group = await db.collection("group").findOne({ id: id });
      if (!group) {
        return res.status(404).json({
          error: "GET/api/group/:id = Group not found in database!",
        });
      }
      // 2) check permission
      if (!canManageGroup(req.body, group)) {
        return res.status(404).json({
          error: "GET/api/group/:id = Not allowed to view this group",
        });
      }
      return res.json(group);
    } catch (e) {
      console.log("GET/api/group/:id = ", e);
      return res.status(500).json({
        error: "GET/api/groups/:id = Failed to load a group",
      });
    }
  });

  // list all groups for search button feature
  app.get("/api/search/groups", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const groups = await db.collection("group").find({}).toArray();
      const channels = await db.collection("channel").find({}).toArray();
      const user = req.user;
      // 1) only send necessary group info
      const mapped_groups = groups.map((group) => {
        const groupChannels = channels.filter((c) => c.group_id === group.id);
        return {
          id: group.id,
          name: group.name,
          creator: group.creator,
          isAdmin: group.creator === user.username,
          isMember: group.members.includes(user.username),
          channelCount: groupChannels.length,
          memberCount: group.members.length,
          requests: group.requests,
        };
      });
      return res.json(mapped_groups);
    } catch (e) {
      console.log("GET/api/search/groups = ", e);
      return res.status(500).json({
        error:
          "GET/api/search/groups = Failed to load groups for search feature",
      });
    }
  });

  // create a new group
  app.post("/api/group/", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const user = req.user;
      // 1) check for permission
      if (!canCreateGroup(user)) {
        return res.status(404).json({
          error: "POST/api/group/ = Not allowed to create groups",
        });
      }
      // 2) validate name
      const { name, members = [], requests = [] } = req.body || {};
      if (!name) {
        return res.status(404).json({
          error: "POST/api/group/ = Group name required",
        });
      }
      // 3) generate a new increament of group id
      const last_id = await db
        .collection("group")
        .find({})
        .sort({ id: -1 })
        .limit(1)
        .next();
      const next_id = last_id ? String(parseInt(last_id.id, 10) + 1) : "1";
      // 4) build a new group
      const new_group = new Group(
        next_id,
        name,
        user.username,
        members,
        requests
      );
      // 5) insert to db and send it back
      await db.collection("group").insertOne(new_group);
      return res.json(new_group);
    } catch (e) {
      console.log("POST/api/group = ", e);
      return res.status(500).json({
        error: "POST/api/group = Failed to load groups",
      });
    }
  });

  // edit a group
  app.put("/api/group/:id", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const user = req.user;
      const { id } = req.params;
      // 1) load group from db
      const group = await db.collection("group").findOne({ id: id });
      if (!group) {
        return res.status(404).json({
          error: "PUT/api/group/:id = Group not found in database",
        });
      }
      // 2) check for permission
      if (!canManageGroup(user, group)) {
        return res.status(403).json({
          error: "PUT/api/group/:id = Not allowed to edit this group",
        });
      }
      // 3) get info from body
      const { name, members, requests } = req.body || {};
      const result = await db
        .collection("group")
        .findOneAndUpdate(
          { id },
          { $set: { name, members, requests } },
          { returnDocument: "after" }
        );
      return res.json(result);
    } catch (e) {
      console.log("PUT/api/group/:id = ", e);
      return res.status(500).json({
        error: "PUT/api/group/:id = Failed to edit a group",
      });
    }
  });

  // delete a group
  app.delete("/api/group/:id", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const user = req.user;
      const { id } = req.params;
      // 1) load group from db
      const group = await db.collection("group").findOne({ id: id });
      if (!group) {
        return res.status(404).json({
          error: "DELETE/api/group/:id = Group not found in database",
        });
      }
      // 2) check permission
      if (!canManageGroup(user, group)) {
        return res.status(403).json({
          error: "DELETE/api/group/:id = Not allowed to edit this group",
        });
      }
      // 3) delete all channels belonging to the group
      await db.collection("channel").deleteMany({ group_id: id });
      // 4) delete the group itself
      await db.collection("group").deleteOne({ id });
      return res.json({ deleted: group.name });
    } catch (e) {
      console.log("DELETE/api/group/:id = ", e);
      return res.status(500).json({
        error: "DELETE/api/group/:id = Failed to delete a group",
      });
    }
  });

  // remove self from a group
  app.delete("/api/group/:id/member", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const user = req.user;
      const { id } = req.params;
      const username = user.username;
      // 1) load group by id
      const group = await db.collection("group").findOne({ id });
      if (!group) {
        return res.status(404).json({
          error: "DELETE/api/group/:id/member = Group not found in database",
        });
      }
      // 2) check if a member of the group
      if (!isGroupMember(user, group)) {
        return res.status(400).json({
          error:
            "DELETE/api/group/:id/member = User is not a member of this group",
        });
      }
      // 3) remove from group member
      await db
        .collection("group")
        .updateOne({ id }, { $pull: { members: username } });
      // 4) remove from channel users and banned users
      await db.collection("channel").updateMany(
        { group_id: id },
        {
          $pull: {
            channel_users: username,
            banned_users: username,
          },
        }
      );
      return res.json({ removed: username, group_id: id });
    } catch (e) {
      console.log("DELETE/api/group/:id/member = ", e);
      return res.status(500).json({
        error:
          "DELETE/api/group/:id/member = Failed to remove a member from group",
      });
    }
  });

  // add self to a group's request
  app.patch("/api/group/:id/request", attachUser, async (req, res) => {
    try {
      const db = getDB();
      const user = req.user;
      const { id } = req.params;
      const username = user.username;
      // 1) load group by id
      const group = await db.collection("group").findOne({ id });
      if (!group) {
        return res.status(404).json({
          error: "PATCH/api/group/:id/request = Group not found in database",
        });
      }
      // 2) check if a member of the group
      if (isGroupMember(user, group)) {
        return res.status(400).json({
          error: "PATCH/api/group/:id/request = Already a member of this group",
        });
      }
      // 3) check if already requested
      if (group.requests.includes(username)) {
        return res.json(username);
      }
      // 4) add to request
      await db
        .collection("group")
        .findOneAndUpdate(
          { id },
          { $addToSet: { requests: username } },
          { returnDocument: "after" }
        );
      return res.json(username);
    } catch (e) {
      console.log("PATCH/api/group/:id/request = ", e);
      return res.status(500).json({
        error: "PATCH/api/group/:id/request = Failed to add a request to group",
      });
    }
  });
}
