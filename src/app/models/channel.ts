export class Channel {
  id?: string;
  name: string;
  group_id?: string;
  banned_users?: any[];
  channel_users?: any[];
  newly_added?: boolean;

  constructor(
    id: string,
    name: string,
    group_id: string,
    banned_users: any[] = [],
    channel_users: any[] = [],
    newly_added: boolean = false,
  ) {
    this.id = id;
    this.name = name;
    this.group_id = group_id;
    this.banned_users = banned_users;
    this.channel_users = channel_users;
    this.newly_added = newly_added
  }
}
