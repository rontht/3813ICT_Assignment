import { Message } from "./message";

describe('Message', () => {
  it('should create an instance', () => {
    const msg = new Message('channel-1', 'user-1');
    expect(msg).toBeTruthy();
    expect(msg.channel_id).toBe('channel-1');
    expect(msg.sender).toBe('user-1');
  });
});
