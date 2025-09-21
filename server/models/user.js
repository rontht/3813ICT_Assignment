class User {
  constructor(username, name, email, password, role, valid) {
    this.username = username;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.valid = valid;
  }
}

module.exports = User;
