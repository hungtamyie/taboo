function attemptStartGame(){
    socket.emit("game_start_request", {});
}

function attemptStartTurn(){
    socket.emit("turn_start_request", {});
}