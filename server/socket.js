module.exports = {
  connect: function (io, PORT) {
    io.on("connection", (socket) => {
      console.log("user connection on port " + PORT + " : " + socket.id);

      socket.on("new_message", (message) => {
        io.emit("new_message", message);
      });

      socket.on("disconnect", () => {
        io.emit("disconnect1");
      });
    });
  },
};
