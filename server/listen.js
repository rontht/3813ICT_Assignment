module.exports = {
  listen: (server, PORT) => {
    server.listen(PORT, () => {
      console.log(
        "Server has been started on port:" + PORT
      );
    });
  },
};
