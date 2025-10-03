import { getDB } from "../db.js";

export async function saveMessage(message) {
  try {
    const db = getDB();
    message.createdAt = new Date();
    const last_message = await db
      .collection("message")
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .next();

    const last_id = last_message ? parseInt(last_message.id, 10) : 0;
    message.id = String(last_id + 1);

    if (!message.attachments) message.attachments = [];
    await db.collection("message").insertOne(message);
    return message;
  } catch (err) {
    console.error("Error saving message:", err);
    throw err;
  }
}

export async function getMessages(channel_id) {
  try {
    const db = getDB();
    const messages = await db
      .collection("message")
      .find({ channel_id })
      .sort({ createdAt: 1 })
      .toArray();

    const formatted = messages.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }));
    return formatted;
  } catch (err) {
    console.error("Error fetching messages:", err);
    throw err;
  }
}
