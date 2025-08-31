class User {
  constructor(username, name, email, password, role, groups = [], valid) {
    this.username = username;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.groups = groups;
    this.valid = valid;
  }
}

module.exports = User;
