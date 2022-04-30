const GameLobby = require("./GameLobby");

module.exports = (io, socket, gameLobbies) => {
    function createNewLobby(){
        if(socket.data.currentLobby != "nolobby"){
            socket.emit("commandFailed", {message: "You can't create a lobby because you are already in one!"});
            console.log(socket.id + " tried and failed to create a lobby");
            return false;
        }

        //lobbyId = generateNewLobbyId();
        //NOT RANDOMIZING FOR TESTING PURPOSES DELETE LATER DELETE DELETE DELETE
        lobbyId = "XWRC";
        socket.join(lobbyId);
        socket.data.currentLobby = (lobbyId);
        gameLobbies[lobbyId] = new GameLobby();
        console.log(socket.id + " created the lobby " + lobbyId);
        console.log(getActiveRooms())
    }

    function joinLobby(data){
        let activeRooms = getActiveRooms();
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
        console.log(socket.id + " joined the lobby " + lobbyId);
    }

    function leaveLobby(){
        if(socket.data.currentLobby == "nolobby"){
            socket.emit("commandFailed", {message: "You are not in a lobby."});
            console.log(socket.id + " tried to leave a lobby without being in one.");
        }
        socket.leave(socket.data.currentLobby);
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
            lobbyId = '';
            for ( var i = 0; i < length; i++ ) {
                lobbyId += characters.charAt(Math.floor(Math.random() * characters.length));
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

    socket.on("lobby_data_request", getLobbyData);
    socket.on("lobby_create_request", createNewLobby);
    socket.on("lobby_join_request", joinLobby);
    socket.on("lobby_leave_request", leaveLobby);
}