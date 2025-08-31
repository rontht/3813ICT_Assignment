class Group {
  constructor(id, name, creator_username, members = [], channels = [], requests = []) {
    this.id = id;
    this.name = name;
    this.creator = creator_username;
    this.channels = channels;
    this.members = members;
    this.requests = requests;
  }
}
module.exports = Group;
