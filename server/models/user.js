class User {
  constructor(id, username, email, password, role, groups = [], valid) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.groups = groups;
    this.valid = valid;
  }
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      groups: this.groups,
      valid: this.valid,
    };
  }
}

module.exports = User;
