const User = require("./models/user.js");
const Group = require("./models/group.js");
const Channel = require("./models/channel.js");

const users = [
  // Ron: super-admin, member of multiple groups
  new User("ron", "Ron", "ron@com", "123", "super-admin", ["g001", "g003"]),
  // AJ: group-admin (creator of g002), also member of g001
  new User("aj", "AJ", "aj@com.au", "123", "group-admin", ["g002", "g001"]),
  // Juno: user in g001 & g003
  new User("juno", "Juno", "juno@com.au", "123", "user", ["g001", "g003"]),
  // Momo: user in g002 & g004
  new User("momo", "Momo", "momo@com.au", "123", "user", ["g002", "g004"]),
  // Kira: group-admin (creator of g003), also member of g004
  new User("kira", "Kira", "kira@com.au", "123", "group-admin", [
    "g003",
    "g004",
  ]),
  // Leo: user in g003
  new User("leo", "Leo", "leo@com.au", "123", "user", ["g003"]),
  // Zara: user in g004 & g001
  new User("zara", "Zara", "zara@com.au", "123", "user", ["g004", "g001"]),
  // Max: group-admin (creator of g004), also member of g002
  new User("max", "Max", "max@com.au", "123", "group-admin", ["g004", "g002"]),
];

const groups = [];

// g001: General — creator Ron
const g1 = new Group("g001", "General", "ron");
g1.channels.push("c001", "c002");
g1.members.push("aj", "juno", "zara");
groups.push(g1);

// g002: Advance — creator AJ
const g2 = new Group("g002", "Advance", "aj");
g2.channels.push("c003", "c004");
g2.members.push("momo", "max");
groups.push(g2);

// g003: Projects — creator Kira
const g3 = new Group("g003", "Projects", "kira");
g3.channels.push("c005", "c006");
g3.members.push("ron", "juno", "leo");
groups.push(g3);

// g004: Gaming — creator Max
const g4 = new Group("g004", "Gaming", "max");
g4.channels.push("c007", "c008", "c009");
g4.members.push("ron", "momo", "kira", "zara");
groups.push(g4);

const channels = [
  // g001
  new Channel("c001", "Lobby", "g001"),
  new Channel("c002", "Interest", "g001"),
  // g002
  new Channel("c003", "Lobby", "g002"),
  new Channel("c004", "Research", "g002"),
  // g003
  new Channel("c005", "Announcements", "g003"),
  new Channel("c006", "Tasks", "g003"),
  // g004
  new Channel("c007", "Lobby", "g004"),
  new Channel("c008", "MMO", "g004"),
  new Channel("c009", "FPS", "g004"),
];

module.exports = { users, groups, channels };
