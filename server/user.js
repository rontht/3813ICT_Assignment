class User {
  constructor(id, username, email, password, roles = [], groups = [], valid) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.groups = groups;
    this.valid = valid;
  }
}

module.exports = User;