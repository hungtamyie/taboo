function redrawScreen(game){
    redrawPlayerBox(game);
    if(game.state == "Lobby"){
        switchToPage("lobby");
        redrawLobbyScreen(game);
    }
    else if((["Turn Start", "Choosing Image", "In Round", "Transition"]).includes(game.state)){
        switchToPage("game");
        redrawGameScreen(game);
    }
    else if(game.state == "Game Over"){
        switchToPage("end");
        redrawEndScreen(game);
    }
}

function redrawPlayerBox(game){
    $("#playerCount").html("Players: " + objLength(game.playerSockets));

    //Clears the name box in top right then refills
    $("#playerBox").html("")
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

    $("#lobbyIdDisplay").html(game.lobbyId);
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
        if(game.turnData.currentRound == 5){
            $("#game_round_title").html('Bonus Round')
            $("#game_round_title").css('color', 'rgb(113, 231, 84)')
            $('#bonusImageCircle').css('display', 'inline-block')
        }
        else {
            $("#game_round_title").html('Round ' + (game.turnData.currentRound + 1));
            $("#game_round_title").css('color', 'white')
            $('#bonusImageCircle').css('display', 'none')
        }
        $("#timeBarContainer").css('visibility', 'hidden');

        if(amDescriber){
            $("#startTurnButton").css('visibility', 'visible');
        }
        else {
            $("#startTurnButton").css('visibility', 'hidden');
        }
        if(game.turnData.currentTeam == 'A'){
            $("#describerText").html('<span style="color:#FFC42E;">' + currentDescriberName + '</span> is describing!')
        }
        else {
            $("#describerText").html('<span style="color:#FF826E;">' + currentDescriberName + '</span> is describing!')
        }
        $("#answerBox").html('');
        for(let i = 0; i < players.length; i++){
            if(currentDescriberId != players[i]){
                let playerName = game.playerSockets[players[i]].name;
                let backgroundClass;
                let triangleClass;
                let nameClass;
                if(game.turnData.currentTeam == 'A'){
                    backgroundClass = 'background_a';
                    triangleClass = 'triangle_a';
                    nameClass = 'name_background_a';
                }
                else {
                    backgroundClass = 'background_b';
                    triangleClass = 'triangle_b';
                    nameClass = 'name_background_b';
                }
                $("#answerBox").append('\
                <div class="player_chat_box_container">\
                    <div class="player_chat_box_name_container">\
                        <div class="player_chat_box_name ' + nameClass + '">\
                            ' + playerName + '\
                        </div>\
                    </div>\
                    <br>\
                    <div class="player_chat_box ' + backgroundClass+ '">...</div>\
                    <br>\
                    <div class="relative_anchor">\
                        <div class="' + triangleClass + '"></div>\
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
        if(game.turnData.currentRound == 5){
            $("#game_round_title").html('Bonus Round')
            $("#game_round_title").css('color', 'rgb(113, 231, 84)')
            $('#bonusImageCircle').css('display', 'inline-block')
        }
        else {
            $("#game_round_title").html('Round ' + (game.turnData.currentRound + 1));
            $("#game_round_title").css('color', 'white')
            $('#bonusImageCircle').css('display', 'none')
        }

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
            if(myTeam == game.turnData.currentTeam){
                $("#guessMainDisplayText").html('<span>Guess the word!</span><br>+0/' + currentQuestion.pointValue);
            }
            else {
                $("#guessMainDisplayText").html('<span>Shhhh!</span><br>+0/' + currentQuestion.pointValue);
            }
        }

        $("#answerBox").html('');
        for(let i = 0; i < players.length; i++){
            if(currentDescriberId != players[i]){
                let playerName = game.playerSockets[players[i]].name;
                let playerGuess = '...'
                if(game.turnData.guesses[players[i]]){
                    playerGuess = game.turnData.guesses[players[i]].escapedGuess;
                }
                let backgroundClass;
                let triangleClass;
                if(game.turnData.currentTeam == 'A'){
                    backgroundClass = 'background_a';
                    triangleClass = 'triangle_a';
                    nameClass = 'name_background_a';
                }
                else {
                    backgroundClass = 'background_b';
                    triangleClass = 'triangle_b';
                    nameClass = 'name_background_b';
                }
                $("#answerBox").append('\
                <div class="player_chat_box_container">\
                    <div class="player_chat_box_name_container">\
                        <div class="player_chat_box_name ' + nameClass + '">\
                            ' + playerName + '\
                        </div>\
                    </div>\
                    <br>\
                    <div class="player_chat_box ' + backgroundClass + '">' + playerGuess + '</div>\
                    <br>\
                    <div class="relative_anchor">\
                        <div class="' + triangleClass + '"></div>\
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
            $("#describeDisplayText").html('Describe this ' + question.category + '!');

            if(question.answered == 'yes'){
                $("#describeDisplayText").html(question.name + '<span style="color:rgb(113, 231, 84)"> +' + question.pointValue + '/' + question.pointValue + '</span>');
                $("#describeNextButton").css({'background': '#00B55E', 'color': 'white'});
                $("#describeNextButton").css('pointer-events', 'auto');
                $("#describeGiveUpButton").css({'background': 'grey', 'color': '#aaaaaa'});
                $("#describeGiveUpButton").css('pointer-events', 'none');
                $("#extraSeconds").css('color', '#0E7619');
            }
            else if(question.answered == 'half'){
                $("#describeDisplayText").append('<br><span style="color:#FFC42E">' + game.turnData.bestGuess + ' (+' + question.pointValue/2 + '/' + question.pointValue + ')</span>');
                $("#describeNextButton").css({'background': '#00B55E', 'color': 'white'});
                $("#describeNextButton").css('pointer-events', 'auto');
                $("#describeGiveUpButton").css({'background': 'grey', 'color': '#aaaaaa'});
                $("#describeGiveUpButton").css('pointer-events', 'none');
                $("#extraSeconds").css('color', '#0E7619');
            }
            else {
                $("#describeGiveUpButton").css({'background': '#C93C3C', 'color': 'white'});
                $("#describeGiveUpButton").css('pointer-events', 'auto');
                $("#describeNextButton").css({'background': 'grey', 'color': '#aaaaaa'});
                $("#describeNextButton").css('pointer-events', 'none');
                $("#extraSeconds").css('color', '#aaaaaa');
            }

            if(game.turnData.currentRound == 5){
                $("#extraSeconds").css('visibility', 'hidden');
            }
            else {
                $("#extraSeconds").css('visibility', 'visible');
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
            $("#circle" + (i + 1)).css('border', 'none')
        }
        $("#circle" + (game.turnData.currentRound + 1)).css('border', '1rem solid white')
        if(game.turnData.currentRound == 5)$('#bonusImageCircle').css('border', '1rem solid rgb(113, 231, 84)')
    }
    if(game.state == 'Choosing Image'){
        $("#guessInputBox").css('display', 'none');
        if(game.turnData.currentQuestionIndex == 0){
            $("#selection1").addClass('green_border')
            $("#selection2").removeClass('green_border')
        }
        else {
            $("#selection1").removeClass('green_border')
            $("#selection2").addClass('green_border')
        }
    }
    if(game.state == 'Turn Start'){
        $("#startInputBox").css('display', 'inline-block');
        $("#guessStripeBox").css('display', 'inline-flex');
        $("#describeBackgroundBox").css('display', 'none');
        $("#timeBarContainer").css('visibility', 'hidden');
        $("#guessBackgroundBox").css('display', 'flex');
        $("#guessInputBox").css('display', 'none');
        $("#describeInputBox").css('display', 'none');
        for(let i = 1; i <= 6; i++){
            $("#imageCircle" + i).attr('src', './images/nothing.png')
            $("#imageCircleText" + i).css('color', 'white')
            $("#imageCircleText" + i).html('?')
        }
    }
    if(game.state == 'Transition'){
        $("#guessMainDisplayText").css('color', 'white');
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
        if(game.turnData.currentRound == 6){
            $('#bonusImageCircle').css('display', 'inline-block')
        }
        else {
            $("#game_round_title").html('Round ' + (game.turnData.currentRound + 1));
            $('#bonusImageCircle').css('display', 'none')
        }
        $("#game_round_title").html('Round Ended');
        $("#startInputBox").css('display', 'none');
        $("#timeBarContainer").css('visibility', 'hidden');
        $("#guessStripeBox").css('display', 'inline-flex');
        $("#guessMainDisplayText").html('<span>Loading next turn</span>')
        $("#describeBackgroundBox").css('display', 'none');
        $("#guessBackgroundBox").css('display', 'flex');
        $("#guessInputBox").css('display', 'none');
        $("#describeInputBox").css('display', 'none');
        $("#answerBox").html('');
    }
    if(game.state == 'Transition' || game.state == 'Turn Start'){
        for(let i = 0; i < 5; i++){
            $("#circle" + (i + 1)).css('border', 'none');
        }
        $("#bonusImageCircle").css('border', 'none');
    }

    //Does no matter what
    if(game.turnData.currentTeam == 'A'){
        $("#turnTitle").css('background', '#FFC42E')
    }
    else {
        $("#turnTitle").css('background', '#FF826E')
    }
    $('#team1Title').html(game.teamData.A.name)
    $('#team1Points').html(game.teamData.A.points)
    $('#team2Title').html(game.teamData.B.name) 
    $('#team2Points').html(game.teamData.B.points) 
}

function redrawEndScreen(game){
    $("#statBoxTitleA").html(game.teamData.A.name);
    $("#finalScoreA").html(game.teamData.A.points);
    $("#statBoxTitleB").html(game.teamData.B.name);
    $("#finalScoreB").html(game.teamData.B.points);

    $("#statTableA").html('<tbody></tbody>');
    $("#statTableB").html('<tbody></tbody>');

    let pointScorersA = game.teamData.A.pointScorers;
    let pointScorersB = game.teamData.B.pointScorers;
    for (let key in pointScorersA) {
        if (pointScorersA.hasOwnProperty(key)) {
            $('#statTableA > tbody:last-child').append('<tr><td>' + key + '</td><td>' + pointScorersA[key] + ' pts</td></tr>');
        }
    }
    for (let key in pointScorersB) {
        if (pointScorersB.hasOwnProperty(key)) {
            $('#statTableB > tbody:last-child').append('<tr><td>' + key + '</td><td>' + pointScorersB[key] + ' pts</td></tr>');
        }
    }
}