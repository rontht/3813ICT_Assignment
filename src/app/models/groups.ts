export class Groups {
    id: string;
    name: string;
    creator: string;
    isAdmin: boolean;
    isMember: boolean;
    channelCount: number;
    memberCount: number;

    constructor(
        id: string,
        name: string,
        creator: string,
        isAdmin: boolean,
        isMember: boolean,
        channelCount: number,
        memberCount: number
    ) {
        this.id = id;
        this.name = name;
        this.creator = creator;
        this.isAdmin = isAdmin;
        this.isMember = isMember;
        this.channelCount = channelCount;
        this.memberCount = memberCount;
    }
}
