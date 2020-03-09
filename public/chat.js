$(function() {
  //make connection
  var socket = io.connect("http://localhost:3000");
  const endPoint = "http://localhost:3000/api";

  //buttons and inputs
  var messageInput = $("#message");
  var username = $("#username");
  var send_message = $("#send_message");
  var send_username = $("#send_username");
  // var chatroom = $("#chatroom");
  const roomButton = $(".room-button");
  const eventLogButton = $("#event_log");
  const roomHistoryButton = $("#room_history");
  const allHistoryButton = $("#all_history");
  var feedback = $("#feedback");
  let currentRoom = "room1";
  let currentUsername = "Anonymous";

  socket.on("connect", data => {
    const date = new Date();
    let type = "CONNECTION";
    const user = currentUsername;
    addToDatabase({ type, user, date }, "eventlog/createlog");
    type = "JOINED";
    addToDatabase({ type, user, date }, "eventlog/createlog");
  });

  socket.on("disconnect", data => {
    const date = new Date();
    let type = "DISCONNECTION";
    const user = currentUsername;
    addToDatabase({ type, user, date }, "eventlog/createlog");
  });

  //Emit message
  send_message.click(function() {
    socket.emit("new_message", {
      message: messageInput.val(),
      room: currentRoom
    });
    const date = new Date();
    const sender = currentUsername;
    const chat_room = currentRoom;
    const message = messageInput.val();
    addToDatabase({ sender, date, message, chat_room }, "history/addhistory");
  });

  // Change room
  roomButton.on("click", event => {
    event.preventDefault();
    const oldRoom = $(".room-section.d-block").attr("id");
    const newRoom = event.currentTarget.getAttribute("value");
    if (oldRoom !== newRoom) {
      socket.emit("change_room", { oldRoom: oldRoom, newRoom: newRoom });
      $(`#${newRoom}`).removeClass("d-none");
      $(`#${newRoom}`).addClass("d-block");
      $(`#${oldRoom}`).removeClass("d-block");
      $(`#${oldRoom}`).addClass("d-none");
      currentRoom = newRoom;
    }
  });
  //Listen on new_message
  socket.on("new_message", data => {
    $(`#${data.room} .feedback`).html("");
    messageInput.val("");
    $(`#${data.room}`).append(
      "<p class='message'>" + data.username + ": " + data.message + "</p>"
    );
  });

  //Emit a username
  send_username.click(function() {
    socket.emit("change_username", { username: username.val() });
    currentUsername = username.val();
  });

  //Emit typing
  messageInput.bind("keypress", () => {
    socket.emit("typing");
  });

  //Listen on typing
  socket.on("typing", data => {
    $(`#${data.room} .feedback`).html(
      "<p><i>" + data.username + " is typing a message..." + "</i></p>"
    );
  });

  // Show event log
  eventLogButton.on("click", event => {
    event.preventDefault();
    const eventLogTable = $(
      `[data-table="${event.currentTarget.getAttribute("id")}"]`
    );
    eventLogTable.removeClass("d-none");
    getFromDatabase("eventlog").then(data => {
      eventLogTable.find("tbody").empty();
      data.forEach(row => {
        eventLogTable
          .find("tbody")
          .append(
            `<tr><td>${row.type}</td><td>${row.user}</td><td>${row.date}</td></tr>`
          );
      });
    });
  });

  function addToDatabase(logForm, url) {
    (async () => {
      try {
        const rawResponse = await fetch(`${endPoint}/${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(logForm)
        });
        const content = await rawResponse.json();

        console.log(content);
      } catch (error) {}
    })();
  }

  async function getFromDatabase(url) {
    let content;
    try {
      const rawResponse = await fetch(`${endPoint}/${url}`);
      content = await rawResponse.json();
    } catch (error) {}
    return await content;
  }

  async function getFromDatabasePost(url, postForm) {
    let content;
    try {
      const rawResponse = await fetch(`${endPoint}/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postForm)
      });
      content = await rawResponse.json();
    } catch (error) {}
    return await content;
  }

  //show all messages
  allHistoryButton.on("click", event => {
    event.preventDefault();
    const allChatTable = $(
      `[data-table="${event.currentTarget.getAttribute("id")}"]`
    );
    allChatTable.removeClass("d-none");
    getFromDatabase("history").then(data => {
      allChatTable.find("tbody").empty();
      data.forEach(row => {
        allChatTable
          .find("tbody")
          .append(
            `<tr><td>${row.sender}</td><td>${row.date}</td><td>${row.chat_room}</td><td>${row.message}</tr>`
          );
      });
    });
  });
});
