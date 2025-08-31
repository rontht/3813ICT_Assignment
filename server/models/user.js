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
  toJSON() {
    return {
      username: this.username,
      name: this.name,
      email: this.email,
      role: this.role,
      groups: this.groups,
      valid: this.valid,
    };
  }
}

module.exports = User;
