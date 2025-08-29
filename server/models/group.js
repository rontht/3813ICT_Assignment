class Group {
  constructor(id, name, creator_id) {
    this.id = id;
    this.name = name;
    this.creator = creator_id;
    this.channels = [];

    // auto membership and admin rights to creator
    this.members = [creator_id];
    this.admins = [creator_id];
  }

  // add a new member
  addMember(user_id) {
    if (!this.members.includes(user_id)) {
      this.members.push(user_id);
    }
  }

  // remove a member (also remove from admin)
  removeMember(user_id) {
    this.members = this.members.filter(id => id !== user_id);
    this.admins = this.admins.filter(id => id !== user_id);
  }

  // promote a user to admin
  promoteToAdmin(user_id) {
    if (this.members.includes(user_id) && !this.admins.includes(user_id)) {
      this.admins.push(user_id);
    }
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
