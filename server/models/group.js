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
}
module.exports = Group;
