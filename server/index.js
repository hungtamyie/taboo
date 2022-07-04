const express = require('express');
const app = express();
const serv = require('http').Server(app);
const path = require('path')

const port = 2000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '/client/index.html'));
});
app.use(express.static(path.join(__dirname, '..', '/client')))

serv.listen(port, (error)=>{
    if(error) {
        console.log('Something went wrong', error)
    }
    else {
        console.log('Server is listening on port ' + port)
    }
});
const io = require('socket.io')(serv, {'pingInterval': 2000, 'pingTimeout': 5000});
const registerRoomEvents = require("./roomEvents")
const registerLobbyChangeEvents = require("./lobbyChangeEvents")
var gameLobbies = {};
const GameLobby = require("./lobbyChangeEvents")

io.on("connection", (socket) => {
    console.log(socket.id + " connected");
    socket.data.currentLobby = "nolobby";
    socket.data.packetsSentInLast5Seconds = 0;
    socket.data.address = String(socket.request.connection.remoteAddress);
    registerRoomEvents(io, socket, gameLobbies);
    registerLobbyChangeEvents(io, socket, gameLobbies);
    socket.on("disconnect", (reason) => {
        if(socket.data.currentLobby != "nolobby"){
            gameLobbies[socket.data.currentLobby].removePlayerSocketId(socket.id);
            io.to(socket.data.currentLobby).emit("game_update", {currentState: gameLobbies[socket.data.currentLobby].toJSON()});
        }
    });
})

//Server tick
const Utility = require("./utility");
const utility = new Utility;
function serverTick(i) {
    setTimeout(() => {
        //Delete empty game lobbies
        for (const key in gameLobbies) {
            if (gameLobbies.hasOwnProperty(key)) {
                if(utility.objLength(gameLobbies[key].playerSockets) == 0){
                    delete gameLobbies[key];
                }
                else {
                    gameLobbies[key].update();
                }
            }
        }
        serverTick(); 
    }, 200)
}

serverTick(0);