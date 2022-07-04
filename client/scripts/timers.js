var imageChoiceTimer = "none";
function startImageChoiceTimer(timestamp){
    if(imageChoiceTimer == "none"){
        imageChoiceTimer = window.setInterval(()=>{
            let currentTime = new Date().getTime();
            let timeLeft = 5 - Math.floor((currentTime-timestamp)/1000);
            let percentage = 1.2 - Math.log10(((currentTime-timestamp)/1000 - Math.floor((currentTime-timestamp)/1000))*2);
            if(percentage > 3){percentage = 3}
            if(percentage < 1){percentage = 1};
            if(timeLeft <= 0){
                timeLeft = 0;
            }
            $("#selectionTime").html(timeLeft);
            $("#selectionTime").css({
                '-webkit-transform' : 'scale(' + percentage + ')',
                '-moz-transform'    : 'scale(' + percentage + ')',
                '-ms-transform'     : 'scale(' + percentage + ')',
                '-o-transform'      : 'scale(' + percentage + ')',
                'transform'         : 'scale(' + percentage + ')'
            });
            if(timeLeft < 1){
                $("#selectionTime").css('color', '#C93C3C')
            }
            else {
                $("#selectionTime").css('color', '#FFC42E')
            }
            if(timeLeft == 0 && percentage < 1.1){
                window.clearInterval(imageChoiceTimer);
                imageChoiceTimer = "none";
            }
        }, 50)
    }
}

var roundTimer = "none";
function startRoundTimer(startTimestamp, duration){
    if(roundTimer == "none"){
        roundTimer = window.setInterval(()=>{
            let currentTime = new Date().getTime();
            let timeLeft = duration - ((currentTime-startTimestamp)/1000);

            let percentage = timeLeft/duration;
            if(percentage > 1){percentage = 1}
            if(percentage < 0){percentage = 0}
            $("#timeBar").css('width', (percentage * 120) + 'rem');

            if(timeLeft <= 0){
                timeLeft = 0;
            }
            $("#timeBarLabel").html(Math.round(timeLeft) + 's');

            if(timeLeft == 0){
                window.clearInterval(roundTimer);
                roundTimer = "none";
            }
        }, 50)
    }
}