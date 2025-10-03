import { saveMessage, getMessages } from "./functions/messages.js";

export function connect(io, PORT) {
  io.on("connection", (socket) => {
    console.log(`User connected on port ${PORT}: ${socket.id}`);

    socket.on("join", async ({ channel_id, username }) => {
      if (!channel_id || !username) return;
      socket.join(channel_id);
      const old_messages = await getMessages(channel_id);
      console.log(`${username} joined channel ${channel_id}`);
      socket.emit("channel_history", old_messages);
      socket.to(channel_id).emit("user_joined", { username, channel_id });
    });

    socket.on("leave", ({ channel_id, username }) => {
      if (!channel_id || !username) return;
      socket.leave(channel_id);
      console.log(`${username} left channel ${channel_id}`);
      socket.to(channel_id).emit("user_left", { username, channel_id });
    });

    socket.on("new_message", async (message) => {
      try {
        const saved_message = await saveMessage(message);
        io.to(message.channel_id).emit("new_message", saved_message);
      } catch (err) {
        console.error("Failed to save or broadcast message:", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}
