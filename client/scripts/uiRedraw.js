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

    //Clears the name box in top right then refills
    $("#playerBox").html("")
    console.log(socket.id);
    console.log(game.hostId);
    for (const key in game.playerSockets) {
        if (game.playerSockets.hasOwnProperty(key)) {
            let playerElem = $("<div>", {class: "player_list_item", text: game.playerSockets[key].name});
            $("#playerBox").append(playerElem);
            if(game.playerSockets[key].id == game.hostId){
                let hostIcon = $("<img>", {class: "crown_icon", src: "./images/crown.svg"})
                $("#playerBox").append(hostIcon)
            }
            else if(socket.id == game.hostId){
                let kickButton = $("<div>", {class: "kick_button edit_player_button", text: "kick"});
                $("#playerBox").append(kickButton);
                let hostButton = $("<div>", {class: "set_host_button edit_player_button", text: "set host"});
                $("#playerBox").append(hostButton);
            }
            $("#playerBox").append("<br>")
        }
    }
    if(playerBoxOn){
        let currentHeight = $("#playerBox").height();
        $("#playerBox").css({"display": "inline-block", 'height': 'auto'});
        let desiredHeight = $("#playerBox").height();
        $("#playerBox").height(currentHeight);
        $("#playerBox").animate({'height': desiredHeight}, 200,()=>{
            playerBoxToggleable = true;
        });
    }
}