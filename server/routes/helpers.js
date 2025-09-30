import { getDB } from "../db.js";

export async function attachUser(req, res, next) {
  try {
    const db = getDB();
    const username = req.header("username");
    if (!username)
      return res.status(404).json({ error: "User not found in header." });

    const user = await db.collection("user").findOne({ username });
    if (!user)
      return res.status(404).json({ error: "User not found in database." });

    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "attachUser failed" });
  }
}

export function isSuper(user) {
  return user.role === "super-admin";
}

export function isGroupAdmin(user) {
  return user.role === "group-admin";
}

export function isGroupMember(user, group) {
  return group.members.includes(user.username);
}

export function isCreator(user, group) {
  return group.creator === user.username;
}

export function canListChannel(user, group) {
  return isSuper(user) || isGroupMember(user, group);
}

export function canManangeChannel(user, group) {
  return isSuper(user) || isCreator(user, group);
}

export function canManageGroup(user, group) {
  return isSuper(user) || isCreator(user, group);
}

export function canCreateGroup(user) {
  return isSuper(user) || isGroupAdmin(user);
}

export function isChannelMember(user, channel) {
  return channel.channel_users.includes(user.username);
}