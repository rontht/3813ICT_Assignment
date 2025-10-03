const PATHS = {
  user: {
    seed:   "../seed/user.json",
    schema: "../schemas/user.json",
    key: { username: 1}
  },
  group: {
    seed:   "../seed/group.json",
    schema: "../schemas/group.json",
    key: { id: 1 }
  },
  channel: {
    seed:   "../seed/channel.json",
    schema: "../schemas/channel.json",
    key: { id: 1 }
  },
  message: {
    seed:   "../seed/message.json",
    schema: "../schemas/message.json",
    key: { id: 1 }
  },
  log: {
    seed: "../seed/log.json",
    schema: "../schemas/log.json",
  }
};
export default PATHS;
