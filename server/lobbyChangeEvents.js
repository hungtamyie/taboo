const GameLobby = require("./GameLobby");
const Utility = require("./utility");
const utility = new Utility;
module.exports = (io, socket, gameLobbies) => {
    function createNewLobby(data){
        socket.data.username = data.username;
        if(socket.data.currentLobby != "nolobby"){
            socket.emit("serverMessage", {head: "Error!", message: "You can't create a lobby because you are already in one!"});
            console.log(socket.id + " tried and failed to create a lobby");
            return false;
        }
        if(containsSpecialChars(socket.data.username)){
            socket.emit("serverMessage", {head: "Error!", message: "You can't use special characters in your name!"});
            console.log(socket.id + " tried to use special characters!");
            return false;
        }

        lobbyId = generateNewLobbyId();

        //Connect socket on server
        socket.join(lobbyId);
        socket.data.currentLobby = (lobbyId);
        gameLobbies[lobbyId] = new GameLobby(lobbyId);
        gameLobbies[lobbyId].addPlayerSocket(socket);
        gameLobbies[lobbyId].setHostId(socket.id);
        console.log(socket.id + " created the lobby " + lobbyId);

        //tell client to he is connected
        socket.emit('lobby_update', {updateType: 'successful_lobby_creation', lobbyId: lobbyId})
        io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[lobbyId].toJSON()});
    }

    function joinLobby(data){
        socket.data.username = data.username;
        let lobbyId = data.lobbyId.toUpperCase();
        if(containsSpecialChars(socket.data.username)){
            socket.emit("serverMessage", {head: "Error!", message: "You can't use special characters in your name!"});
            console.log(socket.id + " tried to use special characters!");
            return false;
        }
        let activeRooms = getActiveRooms();
        if(socket.data.currentLobby != "nolobby"){
            socket.emit("serverMessage", {head: "Error!", message: "You can't join a lobby because you are already in one!"});
            console.log(socket.id + " tried and failed to join a lobby");
            return false;
        }
        if(activeRooms.includes(lobbyId) == false){
            console.log("lobbyId" + lobbyId)
            socket.emit("serverMessage", {head: "Error!", message: "This room doesn't exist!"});
            console.log(socket.id + " tried to join a nonexistent room");
            return false;
        }
        if(gameLobbies[lobbyId].playerIsBanned(socket)){
            socket.emit("serverMessage", {head: "Error!", message: "You are banned from this lobby."});
            console.log(socket.id + " tried to join a banned room");
            return false;
        }
        if(gameLobbies[lobbyId].state != 'Lobby'){
            socket.join(lobbyId);
            socket.data.currentLobby = (lobbyId);
            gameLobbies[lobbyId].addPlayerSocket(socket);
            let lobby = gameLobbies[lobbyId];
            if(lobby.teamData["A"].players.length < 2){
                lobby.setPlayerTeam(socket, 'A')
            }
            else if(lobby.teamData["B"].players.length < 2){
                lobby.setPlayerTeam(socket, 'B')
            }
            else {
                if(Math.random() < 0.5){
                    lobby.setPlayerTeam(socket, 'A')
                }
                else {
                    lobby.setPlayerTeam(socket, 'B')
                }
            }
        }
        else {
            socket.join(lobbyId);
            socket.data.currentLobby = (lobbyId);
            gameLobbies[lobbyId].addPlayerSocket(socket);
        }

        //tell client he is connected
        socket.emit('lobby_update', {updateType: 'successful_lobby_join', lobbyId: lobbyId});
        io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[socket.data.currentLobby].toJSON()});
    }

    function rejoinLobby(data){
        socket.data.username = data.username;
        let lobbyId = data.lobbyId.toUpperCase();
        if(containsSpecialChars(socket.data.username)){
            return false;
        }
        let activeRooms = getActiveRooms();
        if(socket.data.currentLobby != "nolobby"){
            return false;
        }
        if(activeRooms.includes(lobbyId) == false){
            return false;
        }
        if(gameLobbies[lobbyId].playerIsBanned(socket)){
            return false;
        }
        let lobby = gameLobbies[lobbyId]
        socket.join(lobbyId);
        socket.data.currentLobby = (lobbyId);
        lobby.addPlayerSocket(socket);
        if(data.team == "A" || data.team == "B"){
            lobby.setPlayerTeam(socket, data.team);
        }
        socket.emit('lobby_update', {updateType: 'successful_lobby_join', lobbyId: lobbyId});
        socket.emit('rejoin_attempt_received', {})
        io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[socket.data.currentLobby].toJSON()});
    }

    function leaveLobby(){
        if(socket.data.currentLobby == "nolobby"){
            socket.emit("serverMessage", {head: "Error!", message: "You are not in a lobby."});
            console.log(socket.id + " tried to leave a lobby without being in one.");
            return false;
        }
        socket.leave(socket.data.currentLobby);
        let currentLobby = socket.data.currentLobby;
        gameLobbies[currentLobby].removePlayerSocketId(socket.id);
        socket.data.currentLobby = "nolobby";
        io.to(currentLobby).emit("game_update", {currentState: gameLobbies[currentLobby].toJSON()});
        console.log(socket.id + " left a lobby.");
        socket.emit("lobby_update", {updateType: 'lobby_left'});
    }

    function getLobbyData(){
        socket.emit("info", getActiveRooms())
    }

    function updateTeamNames(data){
        let currentLobby = socket.data.currentLobby;

        if(data.A == ''){
            data.A = 'Team A'
        }
        if(data.B == ''){
            data.B = 'Team B'
        }

        gameLobbies[currentLobby].setTeamNames(data.A, data.B);
        io.to(currentLobby).emit("game_update", {currentState: gameLobbies[currentLobby].toJSON()});
    }

    function generateNewLobbyId(){
        var length = 5;
        var lobbyId           = '';
        var characters       = 'BCDFGHJKLMNPQRSTVWXYZ';
        var activeRooms = getActiveRooms();
        do {
            characters       = 'BCDFGHJKLMNPQRSTVWXYZ';
            lobbyId = '';
            for ( var i = 0; i < length; i++ ) {
                charIndex = Math.floor(Math.random() * characters.length);
                lobbyId += characters.charAt(charIndex);
                characters = characters.substring(0, charIndex) + characters.substring(charIndex + 1, characters.length);
            }
        } while(activeRooms.includes(lobbyId));
        return lobbyId;
    }

    function getActiveRooms() {
        const arr = Array.from(io.sockets.adapter.rooms);
        const filtered = arr.filter(room => !room[1].has(room[0]))
        const res = filtered.map(i => i[0]);
        return res;
    }

    function containsSpecialChars(str) {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return specialChars.test(str);
    }

    socket.on("lobby_data_request", getLobbyData);
    socket.on("lobby_create_request", createNewLobby);
    socket.on("lobby_join_request", joinLobby);
    socket.on("lobby_rejoin_request", rejoinLobby);
    socket.on("lobby_leave_request", leaveLobby);
    socket.on("lobby_team_name_update", updateTeamNames);
}