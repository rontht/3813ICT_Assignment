export class Log {
    at!: string;
    actor?: string;
    action!: string;
    target?: string;
    group_id?: string;
    group_name?: string;
    channel_id?: string;
    channel_name?: string;

    constructor(init?: Partial<Log>) {
        Object.assign(this, init);
    }
}