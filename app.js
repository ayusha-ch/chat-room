let express = require("express");
(path = require("path")),
  (mongoose = require("mongoose")),
  (bodyParser = require("body-parser")),
  (dataBaseConfig = require("./db"));
const cors = require("cors");
mongoose.Promise = global.Promise;
mongoose
  .connect(dataBaseConfig.db, {
    useNewUrlParser: true
  })
  .then(
    () => {
      console.log("Database connected sucessfully ");
    },
    error => {
      console.log("Could not be connected to database : " + error);
    }
  );

const historyRoute = require("./routes/history.route");
const eventlogRoute = require("./routes/eventlog.route");
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cors());
app.use("/api/history", historyRoute);
app.use("/api/eventlog", eventlogRoute);

//set the template engine ejs
app.set("view engine", "ejs");

//middlewares
app.use(express.static("public"));

//routes
app.get("/", (req, res) => {
  res.render("index");
});

//Listen on port 3000
server = app.listen(3000);

//socket.io instantiation
const io = require("socket.io")(server);

//listen on every connection
io.on("connection", socket => {
  console.log("New user connected");

  //default username
  socket.username = "Anonymous";
  // Join default room
  socket.join("room1");
  socket.currentRoom = "room1";
  //listen on change_username
  socket.on("change_username", data => {
    socket.username = data.username;
  });

  //listen on new_message
  socket.on("new_message", data => {
    //broadcast the new message
    io.to(data.room).emit("new_message", {
      message: data.message,
      username: socket.username,
      room: data.room
    });
  });

  //listen on typing
  socket.on("typing", data => {
    socket.to(socket.currentRoom).broadcast.emit("typing", {
      room: socket.currentRoom,
      username: socket.username
    });
  });

  // Room change
  socket.on("change_room", data => {
    socket.leave(data.oldRoom, () => {
      io.to(data.oldRoom).emit("new_message", {
        room: data.oldRoom,
        message: `${socket.username} left the room.`,
        username: `Server`
      });
    });
    socket.join(data.newRoom, () => {
      socket.currentRoom = data.newRoom;
      io.to(data.newRoom).emit("new_message", {
        room: data.newRoom,
        message: `${socket.username} joined the room.`,
        username: `Server`
      });
    });
  });

  // Disconnection
  socket.on("disconnect", reason => {
    // Broadcast to channel that a user disconnected
    io.to(socket.currentRoom).emit("new_message", {
      message: `${socket.username} disconnected.`,
      username: `Server`
    });
  });
});
