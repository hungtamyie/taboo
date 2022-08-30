//Puts audio on all buttons
function addAudioToButtons(){
    $("#joinLobbyButton, #createNewLobbyButton").on('mousedown', ()=>{
        playSound('click');
    })
    $("#playerButton, #leaveLobbyButton, #lobbyIdDisplay, #selection1, #selection2, #describeGiveUpButton, #describeNextButton, #goButton, #creditsButton, #closeCreditsButton, #editNameButton1, #editNameButton2").on('mousedown', ()=>{
        playSound('click');
    })
    $("#shuffleButton").on('mousedown', ()=>{
        playSound('card');
    })
    $("#joinTeam1, #joinTeam2, #startTurnButton, #homeButton").on('mousedown', ()=>{
        playSound('click2');
    })
}