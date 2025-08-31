export class Group {
  id?: string;
  name: string;
  creator?: string;
  channels?: string[];
  members?: any[];
  requests?: any[];

  constructor(
    id: string,
    name: string,
    creator: string,
    channels: string[] = [],
    members: any[] = [],
    requests: any[] = []
  ) {
    this.id = id;
    this.name = name;
    this.creator = creator;
    this.channels = channels;
    this.members = members;
    this.requests = requests;
  }
}
