function redrawScreen(game){
    $("#playerCount").html("Players: " + objLength(game.playerSockets));

    //Clear name pools then refill them.
    $("#namePool1").html("")
    $("#namePool2").html("")
    let playerPoolA = game.teamData.A.players
    let playerPoolB = game.teamData.B.players
    for(let i = 0; i < playerPoolA.length; i++){
        var newTag = $("<div>", {class: "name_tag", text: (game.playerSockets[playerPoolA[i]]).name});
        $("#namePool1").append(newTag);
    }
    for(let i = 0; i < playerPoolB.length; i++){
        var newTag = $("<div>", {class: "name_tag", text: (game.playerSockets[playerPoolB[i]]).name});
        $("#namePool2").append(newTag);
    }
}