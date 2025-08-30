import { Member } from "./member";

export class Group {
  id: string;
  name: string;
  creator: string;
  channels: string[];
  members: Member[];

  constructor(
    id: string,
    name: string,
    creator: string,
    channels: string[] = [],
    members: Member[] = []
  ) {
    this.id = id;
    this.name = name;
    this.creator = creator;
    this.channels = channels;
    this.members = members;
  }
}
