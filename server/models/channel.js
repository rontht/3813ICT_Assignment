class Channel {
  constructor(id, name, group_id) {
    this.id = id;
    this.name = name;
    this.group_id = group_id;
    this.banned_users = [];
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      group_id: this.group_id,
      banned_users: this.banned_users,
    };
  }
}
module.exports = Channel;