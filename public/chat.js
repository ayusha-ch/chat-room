$(function() {
    //make connection
    var socket = io.connect("http://localhost:3000");
    const endPoint = "http://localhost:3000/api";

    //buttons and inputs
    var message = $("#message");
    var username = $("#username");
    var send_message = $("#send_message");
    var send_username = $("#send_username");
    // var chatroom = $("#chatroom");
    const roomButton = $(".room-button");
    var feedback = $("#feedback");
    let currentRoom = "room1";
    let currentUsername = "Anonymous";

    socket.on("connect", data => {
        addToEventLog("CONNECTION", currentUsername, "eventlog/createlog");
    });

    //Emit message
    send_message.click(function() {
        socket.emit("new_message", {
            message: message.val(),
            room: currentRoom
        });
    });

    // Change room
    roomButton.on("click", event => {
        event.preventDefault();
        const oldRoom = $(".room-section.d-block").attr("id");
        const newRoom = event.target.getAttribute("value");
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
        message.val("");
        $(`#${data.room}`).append(
            "<p class='message'>" + data.username + ": " + data.message + "</p>"
        );
        console.log(data.room);
    });

    //Emit a username
    send_username.click(function() {
        socket.emit("change_username", { username: username.val() });
        currentUsername = username.val();
    });

    //Emit typing
    message.bind("keypress", () => {
        socket.emit("typing");
    });

    //Listen on typing
    socket.on("typing", data => {
        $(`#${data.room} .feedback`).html(
            "<p><i>" + data.username + " is typing a message..." + "</i></p>"
        );
    });

    function addToEventLog(type, user, url) {
        const date = new Date();
        const logForm = {
            type: type,
            user: user,
            date: date
        };
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
});
