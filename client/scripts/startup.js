window.onload = () => {
    resizeWindow();
    loadAllResources();
    activateEventHandlers();
    switchToPage("logIn");
    window.onresize = function(){
        resizeWindow();
    }
}

function resizeWindow(){
    let targetDimensions = {width: 0, height: 0};
    if(window.innerHeight / 9 * 16 < window.innerWidth){
        targetDimensions.width = window.innerHeight / 9 * 16;
        targetDimensions.height = window.innerHeight;
    }
    else {
        targetDimensions.width = window.innerWidth;
        targetDimensions.height = window.innerWidth / 16 * 9;
    }
    $("#WINDOW").width(targetDimensions.width);
    $("#WINDOW").height(targetDimensions.height);
    $("html").css('font-size', targetDimensions.width/500 + 'px')
}

function loadAllResources(){

}