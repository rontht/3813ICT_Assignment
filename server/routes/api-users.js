/*  Routes
    GET /api/groups/:group_id/members
    GET /api/groups/:group_id/requests
    GET /api/channels/:channel_id/banned
    GET /api/channels/:channel_id/members
    GET /api/users
    DELETE /api/channel/:channel_id/members/:username
    PUT /api/channel/:channel_id/bans/:username
    PUT /api/channel/:channel_id/members/:username
    DELETE /api/user/:username
    PATCH /api/user/:username/role
    GET /api/log
*/

import { getDB } from "../db.js";
import {
  attachUser,
  isCreator,
  isSuper,
  isChannelMember,
  isGroupMember,
  isGroupAdmin,
} from "./helpers.js";
import { format } from "date-fns";

export function route(app) {
  // ____________ USERS ____________
  // get all members from a group
  app.get("/api/groups/:group_id/members", attachUser, async (req, res) => {
    const db = getDB();
    const { group_id } = req.params;
    // 1) find the group
    const group = await db.collection("group").findOne({ id: group_id });
    if (!group) {
      return res.status(404).json({
        error: "GET/api/groups/:group_id/members = Group not found in database",
      });
    }
    // 2) check for permission
    const user = req.user;
    if (!(isSuper(user) && isCreator(user, group))) {
      return res
        .status(403)
        .json({ error: "GET/api/groups/:group_id/members = No permission" });
    }
    // 3) get all usernames from members
    const member_usernames = group.members ? group.members : [];
    if (member_usernames.length === 0) return res.json([]);
    // 4) find the matches from user and filter only necessary
    const members = await db
      .collection("user")
      .find(
        { username: { $in: member_usernames } },
        { projection: { _id: 0, username: 1, name: 1, role: 1 } }
      )
      .toArray();
    return res.json(members);
  });

  // get all requested members from a group
  app.get("/api/groups/:group_id/requests", attachUser, async (req, res) => {
    const db = getDB();
    const { group_id } = req.params;
    // 1) find the group
    const group = await db.collection("group").findOne({ id: group_id });
    if (!group) {
      return res.status(404).json({
        error:
          "GET/api/groups/:group_id/requests = Group not found in database",
      });
    }
    // 2) check for permission
    const user = req.user;
    if (!(isSuper(user) && isCreator(user, group))) {
      return res
        .status(404)
        .json({ error: "GET/api/groups/:group_id/requests = No permission" });
    }
    // 3) get all usernames from requests
    const request_usernames = group.requests ? group.requests : [];
    if (request_usernames.length === 0) return res.json([]);
    // 4) find the matches from user and filter only necessary
    const requests = await db
      .collection("user")
      .find(
        { username: { $in: request_usernames } },
        { projection: { _id: 0, username: 1, name: 1, role: 1 } }
      )
      .toArray();
    return res.json(requests);
  });

  // get all banned members from a group
  app.get("/api/channels/:channel_id/banned", attachUser, async (req, res) => {
    const db = getDB();
    const { channel_id } = req.params;
    // 1) find the channel
    const channel = await db.collection("channel").findOne({ id: channel_id });
    if (!channel) {
      return res.status(404).json({
        error:
          "GET/api/channels/:channel_id/banned = Channel not found in database",
      });
    }
    // 2) find the group
    const group = await db
      .collection("group")
      .findOne({ id: channel.group_id });
    if (!group) {
      return res.status(404).json({
        error:
          "GET/api/channels/:channel_id/banned = Group not found in database",
      });
    }
    // 3) check for permission
    const user = req.user;
    if (!(isSuper(user) || isCreator(user, group))) {
      return res.status(404).json({
        error: "GET/api/channels/:channel_id/banned = No permission",
      });
    }
    // 4) get usernames from banned_users
    const banned_usernames = channel.banned_users ? channel.banned_users : [];
    if (banned_usernames.length === 0) return res.json([]);
    // 5) find matches from user and filter only necessary
    const bans = await db
      .collection("user")
      .find(
        { username: { $in: banned_usernames } },
        { projection: { _id: 0, username: 1, name: 1, role: 1 } }
      )
      .toArray();
    res.json(bans);
  });

  // get all channel members from a channel
  app.get("/api/channels/:channel_id/members", attachUser, async (req, res) => {
    const db = getDB();
    const { channel_id } = req.params;
    // 1) find the channel
    const channel = await db.collection("channel").findOne({ id: channel_id });
    if (!channel) {
      return res.status(404).json({
        error:
          "GET/api/channels/:channel_id/members = Channel not found in database",
      });
    }
    // 2) find the group
    const group = await db
      .collection("group")
      .findOne({ id: channel.group_id });
    if (!group) {
      return res.status(404).json({
        error:
          "GET/api/channels/:channel_id/members = Group not found in database",
      });
    }
    // 3) check for permission
    const user = req.user;
    if (
      !(isSuper(user), isChannelMember(user, channel), isCreator(user, group))
    ) {
      return res.status(404).json({
        error: "GET/api/channels/:channel_id/members = No permission",
      });
    }
    // 4) get usernames from channel_users
    const channel_usernames = channel.channel_users
      ? channel.channel_users
      : [];
    if (channel_usernames.length === 0) return res.json([]);
    // 5) find matches from user and filter only necessary
    const channel_members = await db
      .collection("user")
      .find(
        { username: { $in: channel_usernames } },
        { projection: { _id: 0, username: 1, name: 1, role: 1 } }
      )
      .toArray();
    res.json(channel_members);
  });

  // get all users in the system for admins
  app.get("/api/users", attachUser, async (req, res) => {
    const db = getDB();
    const user = req.user;
    if (!(isSuper(user) && isGroupAdmin(user)))
      return res.status(403).json({ error: "GET/api/users = not permission" });
    const users = await db
      .collection("user")
      .find(
        {},
        { projection: { _id: 0, username: 1, name: 1, email: 1, role: 1 } }
      )
      .toArray();
    return res.json(users);
  });

  // remove user from channel_users
  app.delete(
    "/api/channel/:channel_id/members/:username",
    attachUser,
    async (req, res) => {
      const db = getDB();
      const user = req.user;
      const channel_id = req.params.channel_id;
      const username = req.params.username;
      if (!channel_id || !username)
        return res.status(404).json({
          error:
            "DELETE/api/channel/:channel_id/members/:username = Bad parameters",
        });
      // 1) find the channel
      const channel = await db
        .collection("channel")
        .findOne({ id: channel_id });
      if (!channel) {
        return res.status(404).json({
          error:
            "DELETE/api/channel/:channel_id/members/:username = Channel not found in database",
        });
      }
      // 2) find the group
      const group = await db
        .collection("channel")
        .findOne({ id: channel.group_id });
      if (!group) {
        return res.status(404).json({
          error:
            "DELETE/api/channel/:channel_id/members/:username = Group not found in database",
        });
      }
      // 3) check permission
      if (!(isSuper(user) || isCreator(user, group))) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/bans/:username = Not allowed to delete in this group",
        });
      }
      // 4) remove user from channel_users
      const result = await db
        .collection("channel")
        .findOneAndUpdate(
          { id: channel_id },
          { $pull: { channel_users: username } },
          { returnDocument: "after" }
        );
      return res.json(result.value);
    }
  );

  // add user to banned_users (also remove from channel_users if present)
  app.put(
    "/api/channel/:channel_id/bans/:username",
    attachUser,
    async (req, res) => {
      const db = getDB();
      const actor = req.user;
      const channel_id = req.params.channel_id;
      const username = req.params.username;
      if (!channel_id || !username)
        return res.status(404).json({
          error: "PUT/api/channel/:channel_id/bans/:username = Bad parameters",
        });
      // 1) find the channel
      const channel = await db
        .collection("channel")
        .findOne({ id: channel_id });
      if (!channel) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/bans/:username = Channel not found in database",
        });
      }
      // 2) find the group
      const group = await db
        .collection("group")
        .findOne({ id: channel.group_id });
      if (!group) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/bans/:username = Group not found in database",
        });
      }
      // 3) check permission
      if (!(isSuper(actor) || isCreator(actor, group))) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/bans/:username = Not allowed to edit this group",
        });
      }
      // 4) ensure username is a group member
      const target = await db
        .collection("user")
        .findOne({ username: username });
      if (!isGroupMember(target, group))
        return res.status(409).json({
          error:
            "PUT/api/channel/:channel_id/bans/:username = User not in group",
        });
      // 5) remove from channel users and add to banned users
      const result = await db.collection("channel").findOneAndUpdate(
        { id: channel_id },
        {
          $pull: { channel_users: username },
          $addToSet: { banned_users: username },
        },
        { returnDocument: "after" }
      );
      // 6) write the log
      await db.collection("logs").insertOne({
        at: new Date(),
        actor: actor.username,
        action: "ban",
        channel_id,
        channel_name: channel.name,
        group_id: group.id,
        group_name: group.name,
        target: username,
      });
      return res.json(result.value);
    }
  );

  // add user to channel_users and remove from banned_users
  app.put(
    "/api/channel/:channel_id/members/:username",
    attachUser,
    async (req, res) => {
      const db = getDB();
      const user = req.user;
      const channel_id = req.params.channel_id;
      const username = req.params.username;
      if (!channel_id || !username)
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/members/:username = bad parameters",
        });
      // 1) find the channel
      const channel = await db
        .collection("channel")
        .findOne({ id: channel_id });
      if (!channel) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/members/:username = Channel not found in database",
        });
      }
      // 2) find the group
      const group = await db
        .collection("group")
        .findOne({ id: channel.group_id });
      if (!group) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/members/:username = Group not found in database",
        });
      }
      // 3) check permission
      if (!(isSuper(user) || isCreator(user, group))) {
        return res.status(404).json({
          error:
            "PUT/api/channel/:channel_id/bans/:username = Not allowed to edit this group",
        });
      }
      // 4) must be a group member to join channel
      const target = await db
        .collection("user")
        .findOne({ username: username });
      if (!isGroupMember(target, group))
        return res.status(409).json({
          error:
            "PUT/api/channel/:channel_id/members/:username = Target user is not in the group",
        });
      // 5) remove from banned users and add to channel_users
      const result = await db.collection("channel").findOneAndUpdate(
        { id: channel_id },
        {
          $pull: { banned_users: username },
          $addToSet: { channel_users: username },
        },
        { returnDocument: "after" }
      );
      return res.json(result.value);
    }
  );

  // delete user from database
  app.delete("/api/user/:username", attachUser, async (req, res) => {
    const db = getDB();
    const actor = req.user;
    const username = req.params.username;
    // 1) get target user
    const target = await db.collection("user").findOne({ username: username });
    if (!target) {
      return res.status(404).json({
        error: "DELETE/api/user/:username = User not found",
      });
    }
    // 2) users can delete themselves and super can delete others
    const isActorSuper = actor.role === "super-admin";
    const deletingSelf = actor.username === username;
    if (!deletingSelf && !isActorSuper) {
      return res.status(403).json({
        error: "DELETE/api/user/:username = Not allowed to delete users",
      });
    }
    // 3) cannot delete super admins
    if (isSuper(target)) {
      return res.status(403).json({
        error: "DELETE/api/user/:username = Super Admins cannot be deleted",
      });
    }
    // 4) reassign username for groups where target is creator
    //    prefer the actor but if actor isn't super, find any super-admin
    let newCreator = isActorSuper ? actor.username : null;
    if (!newCreator) {
      const superAdmin = await db
        .collection("user")
        .findOne(
          { role: "super-admin" },
          { projection: { _id: 0, username: 1 } }
        );
      if (!superAdmin) {
        return res.status(409).json({
          error:
            "DELETE/api/user/:username = No super-admin available for reassignment",
        });
      }
      newCreator = superAdmin.username;
    }
    // 5) remove from all groups
    await db.collection("group").updateMany(
      {},
      {
        $pull: { members: username, requests: username },
      }
    );
    // 6) reassign creator
    await db
      .collection("group")
      .updateMany({ creator: username }, { $set: { creator: newCreator } });
    // 7) remove from all channels
    await db.collection("channel").updateMany(
      {},
      {
        $pull: {
          channel_users: username,
          banned_users: username,
        },
      }
    );
    // 8) delete the user
    await db.collection("user").deleteOne({ username });
    return res.json({ deleted: username });
  });

  // promote user to next
  app.patch("/api/user/:username/role", attachUser, async (req, res) => {
    const db = getDB();
    const actor = req.user;
    const username = req.params.username;
    const RANK = { user: 0, "group-admin": 1, "super-admin": 2 };
    // 1) users cannot promote themselves
    if (actor.username === username) {
      return res.status(404).json({
        error:
          "PATCH/api/user/:username/role = You cannot promote your own role",
      });
    }
    // 2) only super admins can promote others
    if (isSuper(actor)) {
      return res.status(404).json({
        error: "PATCH/api/user/:username/role = Not allowed to promote roles",
      });
    }
    // 3) get target user
    const target = await db.collection("user").findOne({ username });
    if (!target) {
      return res.status(404).json({
        error: "PATCH/api/user/:username/role = Target user not found",
      });
    }
    // 4) enforce promote only
    const current = target.role in RANK ? target.role : "user";
    const next = target_role;
    if (RANK[next] < RANK[current]) {
      return res.status(400).json({
        error: "PATCH/api/user/:username/role = no demoting allowed",
      });
    }
    // 5) check if same role
    if (RANK[next] === RANK[current]) {
      return res.json(target);
    }
    // 6) update the role
    const result = await db.collection("user").findOneAndUpdate(
      { username },
      { $set: { role: next } },
      {
        returnDocument: "after",
        projection: { _id: 0, username: 1, name: 1, email: 1, role: 1 },
      }
    );
    return res.json(result.value);
  });

  app.get("/api/log", attachUser, async (req, res) => {
    const db = getDB();
    const user = req.user;
    // only super can see the log
    if (!isSuper(user)) {
      return res.status(404).json({
        error: "GET/api/log = Not allowed to see logs",
      });
    }
    const logs = await db.collection("logs").find({}).toArray();
    const formatted_logs = logs.map((log) => ({
      ...log,
      at:
        log.at instanceof Date
          ? format(log.at, "yyyy-MM-dd HH:mm:ss")
          : String(log.at),
    }));
    return res.json(formatted_logs);
  });
}
