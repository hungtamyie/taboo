var socket = io();

//RECIEVING
socket.on('commandFailed', function(data){
    uiCommandFailed(data);
})
socket.on("info", function(data){
    console.log(data);
});
socket.on('lobby_update', function(data){
    if(data.updateType == "successful_lobby_creation"){
        switchToPage("lobby");
    }
    if(data.updateType == "successful_lobby_join"){
        switchToPage("lobby");
    }
})
socket.on("game_update", function(data){
    redrawScreen(data.currentState);
});


//SENDING
socket.onclose = function(){
    console.log("connection closed")
}

socket.addEventListener("error", function(){
    socket.close()
})

function joinLobby(username, lobbyId){
    socket.emit("lobby_join_request", {lobbyId: lobbyId, username: username});
}

function createLobby(username){
    socket.emit("lobby_create_request", {username: username});
}

function leaveLobby(){
    socket.emit("lobby_leave_request", {})
}

function joinTeam(team){
    console.log("trying to join team")
    socket.emit("team_join_request", {team: team});
}

function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}
