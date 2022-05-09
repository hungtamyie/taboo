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
    //FOR TESTING PURPOSES
    $("#usernameInput").on("click", function() {
        $("#usernameInput").val("InvincibleBlaze")
    });
    $("#joinCodeInput").on("click", function() {
        $("#joinCodeInput").val("TESTA")
    });
    //====================
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

    window.setTimeout(() => {
        createLobby(username);
    }, 500)
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

    window.setTimeout(() => {
        joinLobby(username, code);
    }, 500)
}

function attemptJoinTeam(team){
    joinTeam(team);
}


function uiCommandFailed(data){
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

var currentPage = "logIn";
function switchToPage(page){
    currentPage = page;
    $("#logInWindow").css("display", "none");
    $("#lobbyWindow").css("display", "none");
    $("#gameWindow").css("display", "none");
    $("#topContainer").css("display", "none");
    
    $("#" + page + "Window").css("display", "block");
    if(page == "game" || page == "lobby"){
        $("#topContainer").css("display", "block");
    }
}