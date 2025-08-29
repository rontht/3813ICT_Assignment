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
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      roles: this.roles,
      groups: this.groups,
      valid: this.valid,
    };
  }
}

module.exports = User;
