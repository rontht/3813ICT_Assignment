class Group {
  constructor(id, name, creator_username) {
    this.id = id;
    this.name = name;
    this.creator = creator_username;
    this.channels = [];

    // auto membership and admin rights to creator
    this.members = [creator_username];

    // not necessary
    this.admins = [creator_username];
  }

  // add a new member
  addMember(username) {
    if (!this.members.includes(username)) {
      this.members.push(username);
    }
  }

  // remove a member
  removeMember(username) {
    this.members = this.members.filter(id => id !== username);
    this.admins = this.admins.filter(id => id !== username);
  }

  // add a new channel
  addChannel(channel_id) {
    if (!this.channels.includes(channel_id)) {
      this.channels.push(channel_id);
    }
  }

  // remove a channel
  removeChannel(channel_id) {
    this.channels = this.channels.filter(id => id !== channel_id);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      creator: this.creator,
      channels: this.channels,
      members: this.members,
      admins: this.admins,
    };
  }
}
module.exports = Group;
