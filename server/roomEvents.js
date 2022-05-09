module.exports = (io, socket, gameLobbies) => {
    function joinTeam(data){
        if(socket.data.currentLobby != "nolobby"){  
            lobby = gameLobbies[socket.data.currentLobby];
            if(data.team == "A" || data.team == "B"){
                lobby.setPlayerTeam(socket, data.team);
                console.log("lobby = " + socket.data.currentLobby)
                io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()});
            }
        }
    }

    socket.on("team_join_request", joinTeam)
}