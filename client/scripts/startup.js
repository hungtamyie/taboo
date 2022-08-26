window.onload = () => {
    resizeWindow();
    createCacheElement();
    loadAllResources();
    activateEventHandlers();
    addAudioToButtons();
    switchToPage("logIn");
    //TESTING TEST
    //$("#selectionOverlay").css('display', 'block');
    startBouncingGirl();
    $('#guessBackgroundBox').css('display', 'none');
    //-------------
    $('#playerBox').height($('#playerBoxContent').outerHeight());
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

var cache;
function createCacheElement(){
    cache = document.createElement("CACHE");
    document.body.appendChild(cache);
}

function loadAllResources(){

}

function startBouncingGirl(){
    lastTick = new Date().getTime();
    bounceTick()

    $('#splashScreen').on('click', function(){
        if(!splashPageClicked){
            $('#splashScreenText').html('loading...');
            //$('#splashScreenText').css('font-size', '20rem').css('top', '125rem');
            window.setTimeout(function(){
                $('#splashScreenText').fadeOut(1000);
            },1000)
            initiateAudioContext();
            splashPageClicked = true;
        }
    })
}

var splashPageClicked = false;
var lastTick = 0;
var bounceGirl = {
    x: 200,
    y: 10,
    mX: 120,
    mY: 100,
    rotation: 0,
    rotationDir: 1,
    finalBounce: false,
    rotationConfirmed: false,
    moveConfirmed: false,
    backgroundConfirmed: false,
    backgroundStartTime: Infinity,
    audioConfirmed: false,
    l: false,
}
function bounceTick(){
    let currentTick = new Date().getTime();
    let delta = (currentTick - lastTick)/1000;
    lastTick = currentTick;
    let originX = bounceGirl.x;
    let originY = bounceGirl.y;

    if(bounceGirl.finalBounce){
        if(bounceGirl.rotation < 2 && bounceGirl.rotation > -2 && bounceGirl.moveConfirmed){
            bounceGirl.rotation = 0;
            bounceGirl.rotationConfirmed = true;
        }
        else {
            if(bounceGirl.moveConfirmed){
                bounceGirl.rotation += 120 * delta * bounceGirl.rotationDir * 5;
            }
            else {
                bounceGirl.rotation += 120 * delta * bounceGirl.rotationDir * 1;
            }
            if(bounceGirl.rotation > 360 || bounceGirl.rotation < -360){bounceGirl.rotation = 0}
        }
        let offsetX = (30 - bounceGirl.x);
        let offsetY = (184.5 - bounceGirl.y);
        let distance = Math.sqrt(offsetX**2 + offsetY**2);

        let speed = 1;
        speed = 2 + Math.sqrt(distance)/10;

        bounceGirl.x = bounceGirl.x + offsetX/distance*speed;
        bounceGirl.y = bounceGirl.y + offsetY/distance*speed;
        if(Math.abs(offsetX) < 2){
            bounceGirl.x = 30;
            bounceGirl.y = 184.5;
            bounceGirl.moveConfirmed = true;
        }
    }
    else {
        bounceGirl.rotation += 120 * delta * bounceGirl.rotationDir;
        if(bounceGirl.rotation > 360 || bounceGirl.rotation < -360){bounceGirl.rotation = 0}
        bounceGirl.x += bounceGirl.mX * delta;
        bounceGirl.y += bounceGirl.mY * delta;
        if(bounceGirl.x + 20 < 0 || bounceGirl.x > 500 - 80){
            bounceGirl.x = originX;
            bounceGirl.mX *= -1;
            bounceGirl.rotationDir *= -1;
            if(splashPageClicked){
                bounceGirl.finalBounce = true;
            }
        }
        if(bounceGirl.y + 20 < 0 || bounceGirl.y > 282.5 - 80){
            bounceGirl.y = originY;
            bounceGirl.mY *= -1;
            bounceGirl.rotationDir *= -1;
            if(splashPageClicked){
                bounceGirl.finalBounce = true;
            }
        }
    }
    $("#bouncingGirl").css('top', bounceGirl.y + 'rem');
    $("#bouncingGirl").css('left', bounceGirl.x + 'rem');
    $("#bouncingGirl").css("transform","rotate(" + bounceGirl.rotation + "deg)");

    if(splashPageClicked && !bounceGirl.l && bounceGirl.finalBounce){
        bounceGirl.l = true;
        bounceGirl.backgroundStartTime = new Date().getTime();
        $('#curtainLeft').addClass('curtainBlack')
        $('#curtainRight').addClass('curtainBlack')
    }
    if(new Date().getTime() - bounceGirl.backgroundStartTime > 3000){
        bounceGirl.backgroundConfirmed = true;
    }
    if(bounceGirl.backgroundConfirmed && bounceGirl.audioConfirmed && bounceGirl.rotationConfirmed && bounceGirl.moveConfirmed){
        startMusic();
        $('#curtainLeft').animate({'width': '0rem'}, 1000);
        $('#curtainRight').animate({'width': '0rem'}, 1000, function(){
            $('#splashScreen').css('display', 'none');
            tabooJump();
            console.log('page loaded')
        });
        $('#splashScreen').css('pointer-events', 'none');
    }
    else {
        window.requestAnimationFrame(bounceTick);
    }
}