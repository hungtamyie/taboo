var loading = false;


function activateEventHandlers(){
    $("#createNewLobbyButton").on("click", function() {
        attemptLobbyCreation();
    });
    $("#usernameInput").on("click", function() {
        $("#usernameInput").val("InvincibleBlaze")
    });
}
function attemptLobbyCreation(){
    if(loading){
        return;
    }
    let username = $("#usernameInput").val().trim();
    $("#usernameInput").val(username);
    if(username.length == 0){
        $("#loadingMessage").css("visibility", "visible");
        $("#loadingMessage").html("You need to enter a valid username!");
        return;
    }
    
    $("#loadingMessage").html("Loading...");
    $("#loadingMessage").css("visibility", "visible");
    loading = true;
    window.setTimeout(() => {
        createLobby(username);
    }, 500)
}

function switchToLobbyPage(){
    $("#logInWindow").css("display", "none");
    $("#lobbyWindow").css("display", "block");
}