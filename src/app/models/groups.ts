export class Groups {
    id: string;
    name: string;
    creator: string;
    isAdmin: boolean;
    isMember: boolean;
    channelCount: number;
    memberCount: number;
    requests?: any[];

    constructor(
        id: string,
        name: string,
        creator: string,
        isAdmin: boolean,
        isMember: boolean,
        channelCount: number,
        memberCount: number,
        requests: any[]
    ) {
        this.id = id;
        this.name = name;
        this.creator = creator;
        this.isAdmin = isAdmin;
        this.isMember = isMember;
        this.channelCount = channelCount;
        this.memberCount = memberCount;
        this.requests = requests;
    }
}
