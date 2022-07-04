var socket = io();

//RECIEVING
socket.on('serverMessage', function(data){
    uiServerMessage(data);
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
    if(data.updateType == "lobby_left"){
        switchToPage("logIn");
    }
})
socket.on("game_update", function(data){
    redrawScreen(data.currentState);
});
socket.on("preload_request", function(data){
    console.log(data)
    preloadImageSet(data.images);
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

function kickPlayer(playerId){
    console.log("I am " + socket.id + " and I want to kick " + playerId)
    socket.emit("lobby_kick_request", {playerId: playerId});
    console.log("kicking player " + playerId)
}

function setPlayerHost(playerId){
    socket.emit("lobby_set_host", {playerId: playerId});
}

function joinTeam(team){
    console.log("trying to join team")
    socket.emit("team_join_request", {team: team});
}

function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

function updateTeamNames(a,b){
    socket.emit("lobby_team_name_update", {A: a, B: b});
}

function requestShuffle(){
    socket.emit("shuffle_request");
}