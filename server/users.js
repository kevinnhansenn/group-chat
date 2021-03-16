const users = [];

const addUser = ({ id, name, room }, cb) => {
  name = name.trim();
  room = room.trim();

  // check duplicate
  const haveDuplicate = checkDuplicate(name, room);

  if (haveDuplicate) return cb({ error: "Duplicate User" });

  const user = { id, name, room };
  users.push(user);

  cb({ user });
};

const checkDuplicate = (name, room) => {
  const haveDuplicate = users.find(
    (user) => user.name === name && user.room === room
  );

  return haveDuplicate !== undefined;
};

const deleteUser = (id, cb) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    const user = users.splice(index, 1)[0];
    return cb({ user });
  }

  cb({ error: "User is not exist" });
};

const getUser = (id, cb) => {
  const user = users.find((user) => user.id === id);

  if (user) return cb({ user });

  cb({ error: "User is not exist" });
};

const getUserInRoom = (room, cb) => {
  const usersInRoom = users
    .filter((user) => user.room === room)
    .map((user) => user.name);

  if (usersInRoom.length) return cb({ usersInRoom });

  cb({ error: "No User in this room" });
};

module.exports = {
  addUser,
  checkDuplicate,
  deleteUser,
  getUserInRoom,
  getUser,
};
