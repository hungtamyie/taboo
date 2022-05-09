class GameLobby {
    constructor(){
        this.playerSockets = {};
        this.hostId = "";
        this.teamData = {
            A: {
                points: 0,
                describerPointer: 0,
                players: [],
            },
            B: {
                points: 0,
                describerPointer: 0,
                players: [],
            }
        };
        this.state = "Lobby"
    }
    addPlayerSocket(socket){
        this.playerSockets[socket.id] = socket;
        return true;
    }
    removePlayerSocketId(socketId){
        delete this.playerSockets[socketId];
        for(let i = 0; i < this.teamData["A"].players.length; i++){
            if(this.teamData["A"].players[i] == socketId){
                this.teamData["A"].players.splice(i,1);
            }
        }
        for(let i = 0; i < this.teamData["B"].players.length; i++){
            if(this.teamData["B"].players[i] == socketId){
                this.teamData["B"].players.splice(i,1);
            }
        }
        if(socketId == this.hostId){
            if(Object.keys(this.playerSockets).length > 0){
                this.hostId = this.playerSockets[Object.keys(this.playerSockets)[0]].id;
            }
        }
    }
    setHostId(hostId){
        this.hostId = hostId;
    }
    setPlayerTeam(socket, team){
        if(this.teamData[team].players.includes(socket.id)){
            return false;
        };
        this.teamData[team].players.push(socket.id);
        let otherTeam = team == "A" ? "B" : "A";
        for(let i = 0; i < this.teamData[otherTeam].players.length; i++){
            if(this.teamData[otherTeam].players[i]== socket.id){
                this.teamData[otherTeam].players.splice(i,1);
            }
        }
        return true;
    }
    toJSON(){
        let playerSocketsJSON = {};
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                playerSocketsJSON[key] = {name: this.playerSockets[key].data.username, id: this.playerSockets[key].id};
            }
        }
        return {
            playerSockets: playerSocketsJSON,
            teamData: this.teamData,
            hostId: this.hostId,
            state: this.state
        };
    }
}

module.exports = GameLobby;