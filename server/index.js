const app = require("express")();
const http = require("http").Server(app);
const cors = require("cors");
const bodyParser = require("body-parser");
const Router = require("./router");
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(Router);

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const { addUser, deleteUser, getUser, getUserInRoom } = require("./users");

io.on("connection", (socket) => {
  const id = socket.id;

  socket.on("join", ({ name, room }, cb) => {
    addUser({ id, name, room }, ({ error }) => {
      if (error) return cb({ error });

      socket.join(room);
      socket.emit("message", {
        sender: "Admin",
        message: `Welcome to room ${room}`,
      });
      socket.to(room).emit("message", {
        sender: "Admin",
        message: `${name} has join the room`,
      });

      getUserInRoom(room, ({ usersInRoom }) => {
        io.to(room).emit("roomInfo", usersInRoom);
      });

      console.log(`Socket ${id} has joined a room`);
      cb({});
    });
  });

  socket.on("sendMessage", ({ message }, cb) => {
    getUser(socket.id, ({ error, user }) => {
      if (error) return cb({ error });

      io.to(user.room).emit("message", {
        sender: user.name,
        message,
      });

      cb({});
    });
  });

  socket.on("disconnect", () => {
    deleteUser(id, ({ error, user }) => {
      if (error) return;

      socket.to(user.room).emit("message", {
        sender: "Admin",
        message: `${user.name} has left the chat room`,
      });

      getUserInRoom(user.room, ({ usersInRoom }) => {
        io.to(user.room).emit("roomInfo", usersInRoom);
      });

      console.log(`Socket ${id} has been deleted`);
    });

    socket.disconnect(true);
  });
});

http.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
