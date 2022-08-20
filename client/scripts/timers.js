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
var lastRoundStartTimestamp = 0000;
function startRoundTimer(startTimestamp, duration){
    if(roundTimer != 'none' && lastRoundStartTimestamp != startTimestamp){
        window.clearInterval(roundTimer);
        roundTimer = "none";
    }
    if(roundTimer == "none"){
        lastRoundStartTimestamp = startTimestamp;
        roundTimer = window.setInterval(()=>{
            let currentTime = new Date().getTime();
            let timeLeft = duration - ((currentTime-startTimestamp)/1000);
            $("#extraSeconds").html('+' + Math.round(timeLeft) + ' Extra Seconds');

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


            //work with colors
            /*if(timeLeft > 15){
                $("#timeBar").css('background', '#e721ff');
            }
            else if(timeLeft >= 7){
                $("#timeBar").css('background', '#71E754');
            }
            else if(timeLeft >= 3){
                $("#timeBar").css('background', '#fff221');
            }
            else {
                $("#timeBar").css('background', '#d01919');
            }*/
            let gradient = [['#d01919', 0/duration], ['#fff221', 7/duration], ['#71E754', 10/duration]]
            if(duration > 15){
                gradient.push(['#71E754', 14/duration])
                gradient.push(['#e721ff', 15/duration])
                gradient.push(['#e721ff', 1])
            }
            else {
                gradient.push(['#71E754', 15/duration])
            }
            $("#timeBar").css('background', gradientToColor(gradient, percentage))
        }, 50)
    }
}


function gradientToColor(gradient, percentage){
    if(percentage == 0){
        return gradient[0][0];
    }
    gradientStartPoint = 0;
    gradientEndPoint = gradient.length-1;
    for(let i = 0; i < gradient.length; i++){
        let pointPosition = gradient[i][1];
        if(percentage > pointPosition){
            gradientStartPoint = i;
        }
        else {
            break;
        }
    }
    for(let i = gradient.length-1; i >= 0; i--){
        let pointPosition = gradient[i][1];
        if(percentage <= pointPosition){
            gradientEndPoint = i;
        }
        else {
            break;
        }
    }
    gradientStartPercentage = gradient[gradientStartPoint][1];
    gradientEndPercentage = gradient[gradientEndPoint][1];
    percentageBetweenGradients = (percentage - gradientStartPercentage)/(gradientEndPercentage - gradientStartPercentage);
    return getGradient(gradient[gradientStartPoint][0], gradient[gradientEndPoint][0], 1-percentageBetweenGradients);
}
function getGradient(color1, color2, ratio) {
    const from = rgb(color1)
    const to = rgb(color2)
  
    const r = Math.ceil(from.r * ratio + to.r * (1 - ratio));
    const g = Math.ceil(from.g * ratio + to.g * (1 - ratio));
    const b = Math.ceil(from.b * ratio + to.b * (1 - ratio));
  
    return "#" + hex(r) + hex(g) + hex(b);
  }
  
  /** eg. rgb("#FF0080") => { r: 256, g: 0, b: 128 } */
  function rgb(color) {
    color = color + '';
    const hex = color.replace("#", "")
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    }
  }
  
  /** eg. hex(123) => "7b" */
  function hex(num) {
      num = num.toString(16);
      return (num.length == 1) ? '0' + num : num;
  }