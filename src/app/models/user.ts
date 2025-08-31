export class User {
  username: string;
  name: string;
  email: string;
  role: string;
  groups: string[];
  valid: boolean;

  constructor(
    username: string,
    name: string,
    email: string,
    role: string,
    groups: string[] = [],
    valid: boolean = false
  ) {
    this.username = username;
    this.name = name;
    this.email = email;
    this.role = role;
    this.groups = groups;
    this.valid = valid;
  }
}
