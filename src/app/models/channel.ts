export class Channel {
  id: string;
  name: string;
  group_id: string;
  banned_users: string[];

  constructor(
    id: string,
    name: string,
    group_id: string,
    banned_users: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.group_id = group_id;
    this.banned_users = banned_users;
  }
}
