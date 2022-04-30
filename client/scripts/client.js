var socket = io();


//RECIEVING
socket.on('commandFailed', function(data){
    console.log(data.message)
})
socket.on("info", function(data){
    console.log(data);
});


//SENDING
socket.onclose = function(){
    console.log("connection closed")
}

socket.addEventListener("error", function(){
    socket.close()
})

function joinLobby(name){
    socket.emit("lobby_join_request", {lobbyId: name});
}

function createLobby(){
    socket.emit("lobby_create_request", {});
}

function leaveLobby(){
    socket.emit("lobby_leave_request", {})
}
