class GameLobby {
    prototype(){
        this.playerSockets = {};
        this.teamData = {
            A: {
                describerPointer: 0,
                players: [],
            },
            B: {
                describerPointer: 0,
                players: [],
            }
        };
        this.state = Lobby
    }
    addPlayerSocket(socket){
        this.playersSockets[socket.id] = socket;
    }
    setPlayerTeam(){
        
    }
}

module.exports = GameLobby;