export class User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  groups: string[];
  valid: boolean;

  constructor(
    id: string,
    username: string,
    email: string,
    roles: string[] = [],
    groups: string[] = [],
    valid: boolean = false
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.groups = groups;
    this.valid = valid;
  }
}
