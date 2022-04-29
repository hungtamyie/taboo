module.exports = (io, socket) => {
    function createNewLobby(data){
        socket.join(data.lobbyId);
        socket.data.currentLobby = (data.currentLobby);
    }

    function joinLobby(data){
        socket.join(data.lobbyId);
        socket.data.currentLobby = (data.currentLobby);
    }

    function randomId(){
        
    }
    socket.on("createNewLobby", createNewLobby)
}