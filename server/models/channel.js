class Channel {
  constructor(id, name, group_id) {
    this.id = id;
    this.name = name;
    this.group_id = group_id;
    this.banned_users = [];
  }
}
module.exports = Channel;