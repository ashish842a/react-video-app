const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

const io = new Server({
    cors:true
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const emailToSocketMapping = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (data) => {
    const { email, roomId } = data;
    
    emailToSocketMapping.set(email, socket.id);
    
    socket.join(roomId);
    io.to(roomId).emit('user-joined', { email }); // Use io.to() for emitting to a specific room
    console.log("User joined:", { email, roomId });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    // Remove user from the mapping on disconnect
    for (const [key, value] of emailToSocketMapping.entries()) {
      if (value === socket.id) {
        emailToSocketMapping.delete(key);
        break;
      }
    }
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const SOCKET_PORT = 8001;
io.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO is listening at http://localhost:${SOCKET_PORT}`);
});
