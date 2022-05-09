const GameLobby = require("./GameLobby");
module.exports = (io, socket, gameLobbies) => {
    function createNewLobby(data){
        socket.data.username = data.username;
        if(socket.data.currentLobby != "nolobby"){
            socket.emit("commandFailed", {message: "You can't create a lobby because you are already in one!"});
            console.log(socket.id + " tried and failed to create a lobby");
            return false;
        }
        if(containsSpecialChars(socket.data.username)){
            socket.emit("commandFailed", {message: "You can't use special characters in your name!"});
            console.log(socket.id + " tried to use special characters!");
            return false;
        }

        //lobbyId = generateNewLobbyId();
        //NOT RANDOMIZING FOR TESTING PURPOSES DELETE LATER DELETE DELETE DELETE

        //Connect socket on server
        lobbyId = "TESTA";
        socket.join(lobbyId);
        socket.data.currentLobby = (lobbyId);
        gameLobbies[lobbyId] = new GameLobby();
        gameLobbies[lobbyId].addPlayerSocket(socket);
        gameLobbies[lobbyId].setHostId(socket.id);
        console.log(socket.id + " created the lobby " + lobbyId);

        //tell client to he is connected
        socket.emit('lobby_update', {updateType: 'successful_lobby_creation', lobbyId: lobbyId})
        io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[lobbyId].toJSON()});
    }

    function joinLobby(data){
        socket.data.username = data.username;
        if(containsSpecialChars(socket.data.username)){
            socket.emit("commandFailed", {message: "You can't use special characters in your name!"});
            console.log(socket.id + " tried to use special characters!");
            return false;
        }
        let activeRooms = getActiveRooms();
        console.log(activeRooms);
        if(socket.data.currentLobby != "nolobby"){
            socket.emit("commandFailed", {message: "You can't join a lobby because you are already in one!"});
            console.log(socket.id + " tried and failed to join a lobby");
            return false;
        }
        if(activeRooms.includes(data.lobbyId) == false){
            socket.emit("commandFailed", {message: "This room doesn't exist!"});
            console.log(socket.id + " tried to join a nonexistent room");
            return false;
        }
        
        socket.join(data.lobbyId);
        socket.data.currentLobby = (data.lobbyId);
        gameLobbies[lobbyId].addPlayerSocket(socket);
        console.log(socket.id + " joined the lobby " + lobbyId);

        //tell client he is connected
        socket.emit('lobby_update', {updateType: 'successful_lobby_join', lobbyId: lobbyId});
        io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[lobbyId].toJSON()});
    }

    function leaveLobby(){
        if(socket.data.currentLobby == "nolobby"){
            socket.emit("commandFailed", {message: "You are not in a lobby."});
            console.log(socket.id + " tried to leave a lobby without being in one.");
        }
        socket.leave(socket.data.currentLobby);
        io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[socket.data.currentLobby].toJSON()});
        socket.data.currentLobby = "nolobby";
        console.log(socket.id + " left a lobby.");
    }

    function getLobbyData(){
        socket.emit("info", getActiveRooms())
    }

    function generateNewLobbyId(){
        var length = 4;
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
    socket.on("lobby_leave_request", leaveLobby);
}