var waitingForServer = false;
var canCopy = true;
var draggingMusic = false;
var draggingSFX = false;
function activateEventHandlers(){
    $("#createNewLobbyButton").on("click", function() {
        attemptLobbyCreation();
    });
    $("#joinLobbyButton").on("click", function() {
        attemptJoinLobby();
    });
    $("#creditsWindow").css('display', 'none');
    $("#closeCreditsButton").on("click", function() {
        $("#creditsWindow").fadeOut();
    });
    $("#creditsButton").on("click", function() {
        $("#creditsWindow").fadeIn();
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
    $("#playerButtonContainer").on("mouseleave", function() {
        closePlayerBox();
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
    $("#describeGiveUpButton").on("click", function(){
        giveUp();
    })
    $("#describeNextButton").on("click", function(){
        nextQuestion();
    })
    $("#guessInputBox").on('keypress',function(e) {
        let guess = $("#guessInputBox").val().trim()
        if(e.which == 13 && guess != '') {
            sendGuess(guess);
            $("#guessInputBox").val('');
        }
    });
    $("#homeButton").on('click', function(){
        goHome();
    })

    $("#leaveLobbyButton").on('mouseover', function(){
        $("#leaveLobbyMessage").css("display", "block")
    })
    $("#leaveLobbyButton").on('mouseout', function(){
        $("#leaveLobbyMessage").css("display", "none")
    })
    $("#leaveLobbyButton").on('click', function(){
        goHome();
    })

    $("#lobbyIdDisplay").on('click', function(){
        if(canCopy){
            canCopy = false;
            navigator.clipboard.writeText($("#lobbyIdDisplay").html())
            $("#copiedToClipboardMessage").fadeIn({duration: 10, queue: false, complete: function(){
                $("#copiedToClipboardMessage").fadeOut({duration: 1500, queue: false, complete: function(){
                    canCopy = true;
                }});
            }});
        }
    })

    $("#musicButton").on('click', function(){
        playSound('click')
        if(musicMuted){
            musicMuted = false;
            musicVolume = lastMusicVolume;
            $("#puzzleDreamAudio").stop();
            $("#musicButton").css("text-decoration", "none");
            setMusicBar(musicVolume);
        }
        else {
            musicMuted = true;
            musicVolume = 0;
            $("#puzzleDreamAudio").stop();
            $("#musicButton").css("text-decoration", "line-through");
            setMusicBar(0);
        }
        adjustMusicVolume();
    });


    $("#sfxButton").on('click', function(){
        if(sfxMuted){
            sfxMuted = false;
            sfxVolume = lastSfxVolume;
            $("#sfxButton").css("text-decoration", "none");
            setSFXBar(sfxVolume);
        }
        else {
            sfxMuted = true;
            sfxVolume = 0;
            $("#sfxButton").css("text-decoration", "line-through");
            setSFXBar(0);
        }
        playSound('click')
    });
    document.getElementById('musicBar').onmousedown = function(e){
        musicBarChanged(e);
        draggingMusic = true;
        $("#musicBar").addClass('always_show')

    }
    document.onmousemove = function (e){
        if(draggingMusic == true){
            musicBarChanged(e)
        }
        if(draggingSFX == true){
            sfxBarChanged(e)
        }
    }
    document.onmouseup = function(){
        $("#musicBar").removeClass('always_show');
        $("#sfxBar").removeClass('always_show');
        draggingMusic = false;
        draggingSFX = false;
    }
    function musicBarChanged(e){
        var rect = document.getElementById('musicBar').getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        let percent = 1 - y/rect.height;
        let soundPercent = percent - 0.02;;
        soundPercent = (Math.round((soundPercent * 100)/5)*5)/100;   
        if(soundPercent > 1){
            soundPercent = 1;
        }
        if(soundPercent < 0){
            soundPercent = 0;
        }
        musicVolume = soundPercent;
        lastMusicVolume = soundPercent;
        adjustMusicVolume();
        $("#musicButton").css("text-decoration", "none");
        
        setMusicBar(percent);
    }
    function setMusicBar(percent){
        let margin = 0.08;
        if(percent < margin){
            percent = margin;
        }
        if(percent > 1){
            percent = 1;
        }
        $("#musicBarInner").height((20 * percent) + 'rem')
    }

    document.getElementById('sfxBar').onmousedown = function(e){
        sfxBarChanged(e);
        draggingSFX = true;
        $("#sfxBar").addClass('always_show')

    }
    function sfxBarChanged(e){
        var rect = document.getElementById('sfxBar').getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        let percent = 1 - y/rect.height;
        let soundPercent = percent - 0.04;
        soundPercent = (Math.round((soundPercent * 100)/5)*5)/100;   
        if(soundPercent > 1){
            soundPercent = 1;
        }
        if(soundPercent < 0){
            soundPercent = 0;
        }
        sfxVolume = soundPercent;
        lastSfxVolume = soundPercent;
        setSFXBar(percent);
        $("#sfxButton").css("text-decoration", "none");
    }
    function setSFXBar(percent){
        let margin = 0.08;
        if(percent < margin){
            percent = margin;
        }
        if(percent > 1){
            percent = 1;
        }
        $("#sfxBarInner").height((20 * percent) + 'rem')
    }

    //FOR TESTING PURPOSES
    var randomNamesA = ["Small ", "Big ", "Friendly ", "Great ", "Ugly ", "Running ", "Walking "]
    var randomNamesB = ["Panda", "Cat", "Dog", "Lili", "Parrot", "Pig", "Horse", "Bird"]
    randomName = randomNamesA[Math.floor(Math.random()*randomNamesA.length)] + randomNamesB[Math.floor(Math.random()*randomNamesB.length)];
    //$("#usernameInput").on("click", function() {
        //$("#usernameInput").val(randomName)
    //});
    //$("#joinCodeInput").on("click", function() {
        //window.setTimeout(function(){$("#joinCodeInput").val("TESTA")}, 5)
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
    playSound('server_notif');
    $("#server_message").html('<span style="color: #FFC42E; font-size: 11rem; line-height: 5rem;">' + data.head + '</span><br>' + data.message);
    $("#server_message").animate({opacity: 1},{duration: 500, complete: ()=>{
        window.setTimeout(()=>{
            $("#server_message").animate({opacity: 0},{duration: 500});
        },1000)
    }})
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
    $("#endWindow").css("display", "none");
    $("#topContainer").css("display", "none");
    $("#joinCodeInput").val("");
    $("#loadingMessage").html("");

    if(Storage){
        $("#usernameInput").val(sessionStorage.username);
    }

    $("#" + page + "Window").css("display", "block");
    if(page == "game" || page == "lobby" || page=="end"){
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
function closePlayerBox(){
    if(!playerBoxOn) return;
    $("#playerBox").stop();
    $("#playerButton").stop();
    playerBoxOn = false;
    playerBoxToggleable = false;
    $("#playerBox").animate({'height': '0rem'}, 200,()=>{
        $("#playerBox").css({"display": "none", 'height': 'auto'});
        $("#playerButton").animate({"margin-left": "36rem", "width": "50rem"}, 300, ()=>{
            playerBoxToggleable = true;
        });
    });
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
        socket.emit("change_selection", {selection: 'left'});
    }
    else if(selection == "B"){
        socket.emit("change_selection", {selection: 'right'});
    }
}

function sendGuess(guess){
    socket.emit("submit_guess", {guess: guess});
}

function giveUp(){
    socket.emit("give_up", {giveUp: "yes"});
}

function nextQuestion(){
    socket.emit("next_question", {next_question: "yes"});
}

function goHome(){
    socket.emit("lobby_leave_request", {leave: "yes"});
}

var lastTabooJump = new Date();
function tabooJump(){
    let currentTime = new Date();
    let timePassed = (currentTime.getTime() - lastTabooJump.getTime());
    if(timePassed > 1000){
        lastTabooJump = new Date();
        let letterBank = ['b', 'o', 'u', 'n', 'c', 'e'];
        for(let i = 0; i < 6; i++){
            $('#titleLetter' + i).removeClass(letterBank[i]);
        }
        window.setTimeout(function() {
            for(let i = 0; i < 6; i++){
                $('#titleLetter' + i).addClass(letterBank[i]);
            }
        }, 30)
    }
}