function redrawScreen(game){
    redrawPlayerBox(game);
    if(game.state == "Lobby"){
        switchToPage("lobby");
        redrawLobbyScreen(game);
    }
    else if((["Turn Start", "Choosing Image", "In Round"]).includes(game.state)){
        switchToPage("game");
        redrawGameScreen(game);
    }
}

function redrawPlayerBox(game){
    $("#playerCount").html("Players: " + objLength(game.playerSockets));

    //Clears the name box in top right then refills
    $("#playerBox").html("")
    console.log(game);
    for (const key in game.playerSockets) {
        if (game.playerSockets.hasOwnProperty(key)) {
            playerSocket = game.playerSockets[key];
            let playerElem = $("<div>", {class: "player_list_item", text: playerSocket.name});
            /*if(playerSocket.id == socket.id){
                playerElem.css("color", "#19B8EA")
            }*/
            $("#playerBox").append(playerElem);
            if(playerSocket.id == game.hostId){
                let hostIcon = $("<img>", {class: "crown_icon", src: "./images/crown.svg"})
                $("#playerBox").append(hostIcon)
            }
            else if(socket.id == game.hostId){
                let kickButton = $("<div>", {class: "kick_button edit_player_button", text: "kick"});
                let id = playerSocket.id;
                kickButton.click(()=>{
                    kickPlayer(id);
                })
                $("#playerBox").append(kickButton);
                let hostButton = $("<div>", {class: "set_host_button edit_player_button", text: "set host"});
                hostButton.click(()=>{
                    setPlayerHost(id);
                })
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

function redrawLobbyScreen(game){
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
    //Update the team names
    $("#teamNameInput1").val(game.teamData.A.name);
    $("#teamNameInput2").val(game.teamData.B.name);
    //Change the join buttons based on what team you're on
    let myTeam = "none";
    for(let i = 0; i < playerPoolA.length; i++){
        if(socket.id == game.playerSockets[playerPoolA[i]].id){
            myTeam = "A";
        }
    }
    for(let i = 0; i < playerPoolB.length; i++){
        if(socket.id == game.playerSockets[playerPoolB[i]].id){
            myTeam = "B";
        }
    }
    if(myTeam == "none"){
        $("#joinTeam2, #joinTeam1").css({"visibility": "visible"})
    }
    else if(myTeam == "A") {
        $("#joinTeam1").css({"background": "grey", "pointer-events": "none"})
        $("#joinTeam2").css({"background": "#09CC6E", "pointer-events": "auto"})
    }
    else if(myTeam == "B") {
        $("#joinTeam2").css({"background": "grey", "pointer-events": "none"})
        $("#joinTeam1").css({"background": "#09CC6E", "pointer-events": "auto"})
    }

    $("#joinTeam2")
    //Show/hide buttons based on if lobby leader
    if(socket.id == game.hostId){
        $("#goButton, #shuffleButton, .edit_name_button").css({"visibility": "visible"})
    }
    else {
        $("#goButton, #shuffleButton, .edit_name_button").css({"visibility": "hidden"})
    }
}

function redrawGameScreen(game){
    let currentTeam = game.teamData[game.turnData.currentTeam];
    let currentDescriberPointer = currentTeam.describerPointer
    let currentDescriberId = currentTeam.players[currentDescriberPointer]
    let currentDescriberName = game.playerSockets[currentDescriberId].name
    let amDescriber = currentDescriberId == socket.id;
    let players = currentTeam.players;
    let myTeam = 'A'
    if(game.teamData.B.players.includes(socket.id)){myTeam = 'B'}

    if(game.state == 'Turn Start' || game.state == 'Choosing Image'){
        $("#guessMainDisplayText").html('<span>Waiting<br>for<br>describer</span>');

        $("#turnTitle").html('Turn ' + (game.turnData.currentTurn + 1));
        $("#roundTitle").html('Round ' + (game.turnData.currentRound + 1));
        $("#timeBarContainer").css('visibility', 'hidden');

        if(amDescriber){
            $("#startTurnButton").css('visibility', 'visible');
        }
        else {
            $("#startTurnButton").css('visibility', 'hidden');
        }
        $("#describerText").html('<span style="color:#FF826E;">' + currentDescriberName + '</span> is describing!')
        $("#answerBox").html('');
        for(let i = 0; i < players.length; i++){
            if(currentDescriberId != players[i]){
                let playerName = game.playerSockets[players[i]].name;
                $("#answerBox").append('\
                <div class="player_chat_box_container">\
                    <div class="player_chat_box_name_container">\
                        <div class="player_chat_box_name">\
                            ' + playerName + '\
                        </div>\
                    </div>\
                    <br>\
                    <div class="player_chat_box">' + '...' + '</div>\
                    <br>\
                    <div class="relative_anchor">\
                        <div class="triangle_b"></div>\
                    </div>\
                </div>\
                    \
                ')
            }
        }
        if(game.state == 'Choosing Image'){
            if(amDescriber){
                $("#selectionOverlay").css('display', 'block');
                let potentialChoices = game.turnData.questions[game.turnData.currentRound];
                startImageChoiceTimer(game.stateStartTimestamp);
                $("#selection1").css('background-image', 'url(' + potentialChoices[0].url + ')');
                $("#selectionText1").html('+' + potentialChoices[0].pointValue)
                $("#selection2").css('background-image', 'url(' + potentialChoices[1].url + ')');
                $("#selectionText2").html('+' + potentialChoices[1].pointValue)
            }

            if(game.turnData.currentRound > 0){
                let questions = game.turnData.questions[game.turnData.currentRound - 1];
                let question;
                if(questions[0].chosen) question = questions[0]
                if(questions[1].chosen) question = questions[1]

                $('#guessBackgroundBox').css('display', 'none');
                $('#describeBackgroundBox').css('display', 'block');

                /*let pointsEarned = 0;
                if(question.answered == 'half') pointsEarned = question.pointValue/2;
                if(question.answered == 'yes') pointsEarned = question.pointValue;
                $("#describeDisplayText").html('<span>' + question.name + '(+' + pointsEarned + ')' + '<span>');*/
                $("#describeDisplayText").html(question.name);
                $('#describeBackgroundBox').css('background', 'url("' + question.url + '")');
            }
        }
    }
    if(game.state == 'In Round'){
        startRoundTimer(game.stateStartTimestamp, game.turnData.timeThisRound)
        $("#selectionOverlay").css('display', 'none');
        $("#startInputBox").css('display', 'none');
        $("#timeBarContainer").css('visibility', 'visible');
        $("#turnTitle").html('Turn ' + (game.turnData.currentTurn + 1));
        $("#roundTitle").html('Round ' + (game.turnData.currentRound + 1));

        let currentQuestion = game.turnData.questions[game.turnData.currentRound][game.turnData.currentQuestionIndex];
        if(!amDescriber){
            if(myTeam == game.turnData.currentTeam && currentQuestion.answered != 'yes'){
                $("#guessInputBox").css('display', 'block');
                $("#describeInputBox").css('display', 'none');
            }
            else {
                $("#guessInputBox, #describeInputBox").css('display', 'none');
            }
        }
        else {
            $("#describeInputBox").css('display', 'block');
            $("#guessInputBox").css('display', 'none');
        }
        //Question has been answered
        if(currentQuestion.answered == 'yes'){
            $("#guessMainDisplayText").html('<span>' + currentQuestion.name + '</span><br><div style="color:rgb(113, 231, 84)">+' + currentQuestion.pointValue + '/' + currentQuestion.pointValue + '</div>');
        }
        //Someone has gotten close
        else if(currentQuestion.answered == 'half'){
            $("#guessMainDisplayText").html('<span>' + game.turnData.bestGuess + '</span><br><div style="color:#FFC42E">+' + Math.round(currentQuestion.pointValue/2) + '/' + currentQuestion.pointValue + '</div>');
        }
        //Nobody has guessed the answer
        else {
            $("#guessMainDisplayText").html('<span>Guess the word!</span><br>+0/' + currentQuestion.pointValue);
        }

        $("#answerBox").html('');
        for(let i = 0; i < players.length; i++){
            if(currentDescriberId != players[i]){
                let playerName = game.playerSockets[players[i]].name;
                let playerGuess = '...'
                if(game.turnData.guesses[players[i]]){
                    playerGuess = game.turnData.guesses[players[i]].escapedGuess;
                }
                $("#answerBox").append('\
                <div class="player_chat_box_container">\
                    <div class="player_chat_box_name_container">\
                        <div class="player_chat_box_name">\
                            ' + playerName + '\
                        </div>\
                    </div>\
                    <br>\
                    <div class="player_chat_box">' + playerGuess + '</div>\
                    <br>\
                    <div class="relative_anchor">\
                        <div class="triangle_b"></div>\
                    </div>\
                </div>\
                    \
                ')
            }
        }

        if(amDescriber){
            let question = game.turnData.questions[game.turnData.currentRound][game.turnData.currentQuestionIndex];
            let backgroundURL = question.url;
            $('#guessBackgroundBox').css('display', 'none');
            $('#describeBackgroundBox').css('display', 'block');
            $('#describeBackgroundBox').css('background', 'url("' + backgroundURL + '")');
            $("#describeDisplayText").html(question.category);

            if(question.answered == 'yes'){
                $("#describeDisplayText").html(question.name + '<span style="color:rgb(113, 231, 84)"> +' + question.pointValue + '/' + question.pointValue + '</span>');
            }
            else if(question.answered == 'half'){
                $("#describeDisplayText").append('<br><span style="color:#FFC42E">' + game.turnData.bestGuess + ' (+' + question.pointValue/2 + '/' + question.pointValue + ')</span>');
            }
        }
        else {
            $('#guessBackgroundBox').css('display', 'flex');
            $('#describeBackgroundBox').css('display', 'none');
        }
    }
    if(game.state == 'In Round' || game.state == 'Choosing Image'){
        for(let i = 1; i <= 6; i++){
            $("#imageCircle" + i).attr('src', './images/nothing.png')
            $("#imageCircleText " + i).css('color', 'white')
        }
        for(let i = 0; i < game.turnData.currentRound; i++){
            let questions = game.turnData.questions[i];
            let question;
            if(questions[0].chosen) question = questions[0]
            if(questions[1].chosen) question = questions[1]

            let elemId = "#imageCircle" + (i + 1)
            let elemTextId = "#imageCircleText" + (i + 1)
            $(elemId).attr("src", question.url);
            if(question.answered == 'yes'){
                $(elemTextId).html('+' + question.pointValue)
                $(elemTextId).css('color', 'rgb(113, 231, 84)')
            }
            else if(question.answered == 'half'){
                $(elemTextId).html('+' + question.pointValue/2)
                $(elemTextId).css('color', '#FFC42E')
            }
            else {
                $(elemTextId).html('+0')
                $(elemTextId).css('color', 'white')
            }
        }
    }
    if(game.state == 'Choosing Image'){
        $("#guessInputBox").css('display', 'none');
    }
    $('#team1Title').html(game.teamData.A.name)
    $('#team1Points').html(game.teamData.A.points)
    $('#team2Title').html(game.teamData.B.name) 
    $('#team2Points').html(game.teamData.B.points) 
    $('#game_round_title').html('Round ' + (game.turnData.currentRound + 1))
}