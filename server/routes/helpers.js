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

export async function isSuper(user) {
  return user.role === "super-admin";
}

export async function isGroupAdmin(user) {
  return user.role === "group-admin";
}

export async function isGroupMember(user, group) {
  return group.members.includes(user.username);
}

export async function isCreator(user, group) {
  return group.creator === user.username;
}

export async function canListChannel(user, group) {
  return isSuper(user) || isMember(user, group);
}

export async function canManangeChannel(user, group) {
  return isSuper(user) || isCreator(user, group);
}

export async function canManageGroup(user, group) {
  return isSuper(user) || isCreator(user, group);
}

export async function canCreateGroup(user) {
  return isSuper(user) || isGroupAdmin(user);
}
