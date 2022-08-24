const Utility = require("./utility");
const utility = new Utility;
module.exports = (io, socket, gameLobbies) => {
    function joinTeam(data){
        if(socket.data.currentLobby != "nolobby"){  
            let lobby = gameLobbies[socket.data.currentLobby];
            if(data.team == "A" || data.team == "B"){
                lobby.setPlayerTeam(socket, data.team);
                io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()});
            }
        }
    }

    function kickPlayer(data){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.hostId){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the host of this session."})
            return;
        }
        let socketToKick = io.sockets.sockets.get(data.playerId);
        socketToKick.leave(socketToKick.data.currentLobby);
        let currentLobby = socketToKick.data.currentLobby;
        gameLobbies[currentLobby].banPlayer(socket.data.address);
        gameLobbies[currentLobby].removePlayerSocketId(socketToKick.id);
        socketToKick.data.currentLobby = "nolobby";
        io.to(currentLobby).emit("game_update", {currentState: gameLobbies[currentLobby].toJSON()});
        console.log(socketToKick.id + "has been kicked from a lobby.");
        socketToKick.emit("lobby_update", {updateType: 'lobby_left', lobbyId: lobbyId})

        socketToKick.emit("serverMessage", {head: "Update: ", message: "You've been kicked from the lobby. :("});
        socket.emit("serverMessage", {head: "Update: ", message: "You've successfully kicked someone!"});
    }

    function setHost(data){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.hostId){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the host of this session."})
            return;
        }
        if(lobby.playerSockets[data.playerId]){
            lobby.hostId = data.playerId;
            io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()});
        }
        else {
            socket.emit("serverMessage", {head: "Error!", message: "This player no longer exists."})
        }
    }

    function shuffleTeams(){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.hostId){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the host of this session."})
            return;
        }
        lobby.shuffleTeams();
        io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()});
    }
    function startGame(){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.hostId){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the host of this session."})
            return;
        }
        if(lobby.teamData["A"].players.length < 2 || lobby.teamData["B"].players.length < 2){
            socket.emit("serverMessage", {head: "Error!", message: "Both teams must have at least two players!"})
            return;
        }
        lobby.startGame();
        lobby.loadTurn();
        console.log("game started!")
        io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()});
    }
    function startTurn(){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        console.log(socket.id + ", " + lobby.getCurrentDescriberID())
        if(socket.id != lobby.getCurrentDescriberID()){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the describer."})
            return;
        }
        lobby.startRound();
        lobby.updateStateStartTimestamp();
        io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()});
    }
    function changeSelection(data){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.getCurrentDescriberID()){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the describer."})
            return;
        }
        lobby.updateCurrentQuestion(data.selection);
    }
    function giveUp(){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.getCurrentDescriberID()){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the describer!"})
            return;
        }
        lobby.giveUp();
        io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()})
    }
    function nextQuestion(){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id != lobby.getCurrentDescriberID()){
            socket.emit("serverMessage", {head: "Error!", message: "You are not the describer!"})
            return;
        }
        lobby.nextQuestion();
        io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()})
    }
    function submitGuess(data){
        if(socket.data.currentLobby == "nolobby"){
            return
        }
        let lobby = gameLobbies[socket.data.currentLobby];
        if(socket.id == lobby.getCurrentDescriberID()){
            socket.emit("serverMessage", {head: "Error!", message: "You are not a guesser!"})
            return;
        }
        let guess = data.guess;
        if(guess.length > 100){
            socket.emit("serverMessage", {head: "Error!", message: "Your guess is too long!"})
            return;
        }
        lobby.submitGuess(socket.id, data.guess);
        io.to(socket.data.currentLobby).emit("game_update", {currentState: lobby.toJSON()})
    }

    socket.on("team_join_request", joinTeam)
    socket.on("lobby_kick_request", kickPlayer)
    socket.on("lobby_set_host", setHost)
    socket.on("shuffle_request", shuffleTeams)
    socket.on("game_start_request", startGame)
    socket.on("turn_start_request", startTurn)
    socket.on("change_selection", changeSelection)
    socket.on("give_up", giveUp)
    socket.on("next_question", nextQuestion)
    socket.on("submit_guess", submitGuess)
}