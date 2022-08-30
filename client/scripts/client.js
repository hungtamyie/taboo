var socket = io();
var lobbyCache = {
    lobby: false,
    team: false,
    username: false,
}

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
        clearLobbyAndTeam();
        window.clearInterval(roundTimer);
        roundTimer = "none";
        $("#timeBar").removeClass('flash');
        unpauseMusic();
        switchToPage("logIn");
    }
})
socket.on("game_update", function(data){
    updateLobbyAndTeam(data.currentState);
    redrawScreen(data.currentState);
});
socket.on("preload_request", function(data){
    preloadImageSet(data.images);
});

socket.on("game_event", function(data){
    handleGameEvent(data.event);
});

socket.on("chat_message", function(data){
    newChatMessage(data);
});

socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
    }
    //show reconnecting thing
    $("#reconnectWindow").css("display", "inline-flex");
});

socket.on("connect", () => {
    $("#reconnectWindow").css("display", "none");
    rejoinCachedLobby()
});

socket.io.on("reconnect_attempt", () => {
    $("#reconnectWindow").css("display", "inline-flex");
});

socket.on("rejoin_attempt_received", () => {
    lobbyCache = {
        lobby: false,
        team: false,
        username: false,
    }
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem("team", lobbyCache.team)
        sessionStorage.setItem("lobby", lobbyCache.lobby)
        sessionStorage.setItem("username", lobbyCache.username)
    }
    console.log('Rejoin attempt received')
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
    socket.emit("lobby_kick_request", {playerId: playerId});
}

function setPlayerHost(playerId){
    socket.emit("lobby_set_host", {playerId: playerId});
}

function joinTeam(team){
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

function updateLobbyAndTeam(game){
    lobbyCache.team = game.teamData.A.players.includes(socket.id) ? 'A' : 'B';

    lobbyCache.lobby = game.lobbyId;

    lobbyCache.username = game.playerSockets[socket.id].name;

    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem("team", lobbyCache.team)
        sessionStorage.setItem("lobby", lobbyCache.lobby)
        sessionStorage.setItem("username", lobbyCache.username)
    }
}

function clearLobbyAndTeam(){
    lobbyCache.team = false;
    lobbyCache.lobby = false;
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem("team", false);
        sessionStorage.setItem("lobby", false);
    }
}

function rejoinCachedLobby(){
    if(lobbyCache.team && lobbyCache.lobby){
        socket.emit("lobby_rejoin_request", {username: lobbyCache.username, lobbyId: lobbyCache.lobby, team: lobbyCache.team});
    }
}