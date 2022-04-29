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
var games = [];
const io = require('socket.io')(serv, {'pingInterval': 2000, 'pingTimeout': 5000});
const registerRoomEvents = require("./roomEvents")
const registerLobbyChangeEvents = require("./lobbyChangeEvents")

function onConnection(socket){
    console.log(socket.id + " connected");
    registerRoomEvents(io, socket);
    registerLobbyChangeEvents(io, socket);
}

io.on("connection", onConnection);