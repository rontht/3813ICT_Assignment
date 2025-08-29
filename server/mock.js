const User = require("./models/user.js");
const Group = require("./models/group.js");
const Channel = require("./models/channel.js");

const users = [
  new User("u00001", "Ron", "ron@com", "123", ["super-admin"], ["g001"]),
  new User("u00002", "AJ", "aj@com.au", "123", ["group-admin"], ["g002"]),
  new User("u00003", "Juno", "juno@com.au", "123", ["user"], ["g001"]),
  new User("u00004", "Momo", "momo@com.au", "123", ["user"], ["g002"]),
];

const groups = [];

const g1 = new Group("g001", "General", "u00001");
g1.channels.push("c001", "c002");
g1.members.push("u00003");
groups.push(g1);

const g2 = new Group("g002", "Advance", "u00002");
g2.channels.push("c003");
g2.members.push("u00004");
groups.push(g2);

const channels = [
  new Channel("c001", "Lobby", "g001"),
  new Channel("c002", "Interest", "g001"),
  new Channel("c003", "Lobby", "g002"),
];

module.exports = { users, groups, channels };
