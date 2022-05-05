var socket = io();


//RECIEVING
socket.on('commandFailed', function(data){
    console.log(data.message)
})
socket.on("info", function(data){
    console.log(data);
});
socket.on('lobby_update', function(data){
    if(data.updateType == "successful_lobby_creation"){
        switchToLobbyPage(data.lobbyId)
    }
})


//SENDING
socket.onclose = function(){
    console.log("connection closed")
}

socket.addEventListener("error", function(){
    socket.close()
})

function joinLobby(lobbyId, username){
    socket.emit("lobby_join_request", {lobbyId: lobbyId, username: username});
}

function createLobby(username){
    socket.emit("lobby_create_request", {username: username});
}

function leaveLobby(){
    socket.emit("lobby_leave_request", {})
}

function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}
