var waitingForServer = false;

function activateEventHandlers(){
    $("#createNewLobbyButton").on("click", function() {
        attemptLobbyCreation();
    });
    $("#joinLobbyButton").on("click", function() {
        attemptJoinLobby();
    });
    $("#joinTeam1").on("click", function() {
        attemptJoinTeam("A");
    });
    $("#joinTeam2").on("click", function() {
        attemptJoinTeam("B");
    });
    $("#playerButton").on("click", function() {
        togglePlayerBox();
    });
    $("#editNameButton1").on("click", function() {
        allowEdit(1)
    });
    $("#editNameButton2").on("click", function() {
        allowEdit(2)
    });
    $("#shuffleButton").on("click", function() {
        requestShuffle()
    });
    $("#teamNameInput1").on('keypress',function(e) {
        if(e.which == 13) {
            setTeamName(1)
        }
    });
    $("#teamNameInput1").focusout(function(){
        setTeamName(1)
    })
    $("#teamNameInput2").on('keypress',function(e) {
        if(e.which == 13) {
            setTeamName(2)
        }
    });
    $("#teamNameInput2").focusout(function(){
        setTeamName(2)
    })
    $("#goButton").on("click", function(){
        attemptStartGame();
    })
    $("#startTurnButton").on("click", function(){
        attemptStartTurn();
    })
    $("#selection1").on("click", function(){
        updateSelection("A");
    })
    $("#selection2").on("click", function(){
        updateSelection("B");
    })
    $("#guessInputBox").on('keypress',function(e) {
        let guess = $("#guessInputBox").val().trim()
        if(e.which == 13 && guess != '') {
            sendGuess(guess);
            $("#guessInputBox").val('');
        }
    });


    //FOR TESTING PURPOSES
    var randomNamesA = ["Small ", "Big ", "Friendly ", "Great ", "Ugly ", "Running ", "Walking "]
    var randomNamesB = ["Panda", "Cat", "Dog", "Lili", "Parrot", "Pig", "Horse", "Bird"]
    randomName = randomNamesA[Math.floor(Math.random()*randomNamesA.length)] + randomNamesB[Math.floor(Math.random()*randomNamesB.length)];
    //$("#usernameInput").on("click", function() {
        $("#usernameInput").val(randomName)
    //});
    //$("#joinCodeInput").on("click", function() {
        window.setTimeout(function(){$("#joinCodeInput").val("TESTA")}, 5)
    //});
    //====================

    $.fn.hasHScrollBar = function()
    {
        // log(this.get(0).scrollWidth);
        // log(this.width());
        // log(this.innerWidth());
        return this.get(0).scrollWidth > this.innerWidth();
    }
}
function attemptLobbyCreation(){
    let username = $("#usernameInput").val().trim();
    $("#usernameInput").val(username);
    if(invalidUsername(username)){
        $("#loadingMessage").css("visibility", "visible");
        $("#loadingMessage").html(invalidUsername(username));
        return;
    }
    
    $("#loadingMessage").html("Loading...");
    $("#loadingMessage").css("visibility", "visible");

    createLobby(username);
}
function attemptJoinLobby(){
    let username = $("#usernameInput").val().trim();
    $("#usernameInput").val(username);
    code = $("#joinCodeInput").val();
    
    if(code.length < 5){
        $("#loadingMessage").css("visibility", "visible");
        $("#loadingMessage").html("Your code should be 5 characters long!");
        return;
    }
    if(invalidUsername(username)){
        $("#loadingMessage").css("visibility", "visible");
        $("#loadingMessage").html(invalidUsername(username));
        return;
    }

    joinLobby(username, code);
}

function attemptJoinTeam(team){
    joinTeam(team);
}


function uiServerMessage(data){
    //SHould log this onto the screen with big letters.
    $("#server_message").html('<span style="color: #FFC42E; font-size: 11rem; line-height: 5rem;">' + data.head + '</span><br>' + data.message);
    $("#server_message").animate({opacity: 1},{duration: 500, complete: ()=>{
        window.setTimeout(()=>{
            console.log("animating")
            $("#server_message").animate({opacity: 0},{duration: 500});
        },1000)
    }})
    console.log(data);
}

//Returns false if username is valid. Returns error message if username is invalid
function invalidUsername(username){
    if(containsSpecialChars(username)){
        return "Your username can't contain special characters!";
    }
    else if(username.length == 0){
        return "Please enter a username!";
    }
    return false;
}

var currentPage = "none";
function switchToPage(page){
    if(page == currentPage){return false};//Already on page
    currentPage = page;
    $("#logInWindow").css("display", "none");
    $("#lobbyWindow").css("display", "none");
    $("#gameWindow").css("display", "none");
    $("#topContainer").css("display", "none");
    $("#joinCodeInput").val("");
    $("#loadingMessage").html("");

    $("#" + page + "Window").css("display", "block");
    if(page == "game" || page == "lobby"){
        $("#topContainer").css("display", "block");
    }
}

var playerBoxOn = false;
var playerBoxToggleable = true;
function togglePlayerBox(){
    if(!playerBoxToggleable) return;
    if(playerBoxOn){
        playerBoxOn = false;
        playerBoxToggleable = false;
            $("#playerBox").animate({'height': '0rem'}, 200,()=>{
                $("#playerBox").css({"display": "none", 'height': 'auto'});
                $("#playerButton").animate({"margin-left": "36rem", "width": "50rem"}, 300, ()=>{
                    playerBoxToggleable = true;
                });
            });
    }
    else {
        playerBoxOn = true;
        playerBoxToggleable = false;
        $("#playerButton").animate({"margin-left": "0rem", "width": "86rem"}, 300, ()=>{
            $("#playerBox").css({"display": "inline-block", 'height': 'auto'});
            let desiredHeight = $("#playerBox").height();
            $("#playerBox").css({'height': '0rem'});
            $("#playerBox").animate({'height': desiredHeight}, 200,()=>{
                playerBoxToggleable = true;
            });
        });
    }
}

var teamName = {
    "1": "Team 1",
    "2": "Team 2",
}
function allowEdit(team){
    let input = $("#teamNameInput" + team);
    teamName[team] = input.val();
    input.attr("readonly", false);
    input.addClass("inputting");
    input.focus();
    var tmpStr = input.val();
    input.val('');
    input.val(tmpStr);
}

function setTeamName(team){
    let input = $("#teamNameInput" + team);
    teamName[team] = input.val();
    input.removeClass("inputting")
    input.attr("readonly", true);
    updateTeamNames($("#teamNameInput1").val(), $("#teamNameInput2").val())
}

function updateSelection(selection){
    if(selection == "A"){
        $("#selection1").addClass('green_border')
        $("#selection2").removeClass('green_border')
        socket.emit("change_selection", {selection: 'left'});
    }
    else if(selection == "B"){
        $("#selection1").removeClass('green_border')
        $("#selection2").addClass('green_border')
        socket.emit("change_selection", {selection: 'right'});
    }
    else {
        $("#selection1").removeClass('green_border')
        $("#selection2").removeClass('green_border')
    }
}

function sendGuess(guess){
    socket.emit("submit_guess", {guess: guess});
}