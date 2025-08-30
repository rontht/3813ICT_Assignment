export class User {
  id: string;
  username: string;
  email: string;
  role: string;
  groups: string[];
  valid: boolean;

  constructor(
    id: string,
    username: string,
    email: string,
    role: string,
    groups: string[] = [],
    valid: boolean = false
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.groups = groups;
    this.valid = valid;
  }
}
