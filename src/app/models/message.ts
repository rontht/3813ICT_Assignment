export class Message {
    id?: string;
    channel_id: string;
    sender: string;
    body?: string;
    attachments?: any[];
    createdAt?: Date;

    constructor(
        channel_id: string,
        sender: string,
        body: string = '',
        attachments: any[] = [],
        createdAt: Date = new Date(),
        id?: string,
    ) {
        this.id = id;
        this.channel_id = channel_id;
        this.sender = sender;
        this.body = body;
        this.attachments = attachments;
        this.createdAt = createdAt;
    }
}