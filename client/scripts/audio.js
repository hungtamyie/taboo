var musicVolume = 0.5;
var lastMusicVolume = 0.5;
var musicMuted = false;
var musicStarted = false;
var sounds_to_load = [
    ['tick', '../sounds/tick.mp3', 0.5],
    ['click', '../sounds/click.mp3', 0.3],
    ['click2', '../sounds/wood_click.mp3', 0.4],
    ['server_notif', '../sounds/server_notif.mp3', 0.5],
    ['card', '../sounds/card.mp3', 0.5],
    ['gamestart', '../sounds/game_start.wav', 0.5],
    ['puzzledream', '../sounds/puzzledream.mp3', 0.12],
    ['downthedrain', '../sounds/downthedrain.mp3', 0.15],
    ['fail', '../sounds/fail.wav', 0.7],
    ['full_win', '../sounds/full_win.mp3', 0.4],
    ['half_win', '../sounds/half_win.mp3', 0.4],
    ['chat', '../sounds/chat_notif.ogg', 0.3],
    ['ding', '../sounds/start_ding.wav', 0.3],
    ['game_over', '../sounds/game_over.mp3', 0.5],
];

var music = {
    puzzleDream: false,
    downthedrain: false,
    gainA: 0,
    gainB: 0,
    currentMusic: 'chill',
}
function startMusic(){

    music.puzzleDream = audioContext.createBufferSource();
    music.puzzleDream.buffer = sfxBoard['puzzledream'].buffer;
    music.gainA = audioContext.createGain();
    music.gainA.gain.value = sfxBoard['puzzledream'].volume * musicVolume;
    music.puzzleDream.connect(music.gainA).connect(audioContext.destination);
    music.puzzleDream.start();
    music.puzzleDream.loop = true;

    music.downthedrain = audioContext.createBufferSource();
    music.downthedrain.buffer = sfxBoard['downthedrain'].buffer;
    music.gainB = audioContext.createGain();
    music.gainB.gain.value = sfxBoard['downthedrain'].volume * 0;
    music.downthedrain.connect(music.gainB).connect(audioContext.destination);
    music.downthedrain.start();
    music.downthedrain.loop = true;
}
function adjustMusicVolume(){
    if(audioContext == 'not started' || !audioContext){return};
    if(music.currentMusic == 'chill'){
        music.gainA.gain.value = musicVolume * sfxBoard['puzzledream'].volume;
        music.gainB.gain.value = 0;
    }
    else if(music.currentMusic == 'intense'){
        music.gainB.gain.value = musicVolume * sfxBoard['downthedrain'].volume
        music.gainA.gain.value = 0;
    }
}
function changeMusicTo(type){
    if(audioContext == 'not started' || !audioContext){return};
    if(type == "chill" && music.currentMusic != 'chill'){
        music.currentMusic = 'chill';
        music.gainA.gain.linearRampToValueAtTime(musicVolume * sfxBoard['puzzledream'].volume, audioContext.currentTime + 4);
        music.gainB.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    }
    else if(type == "intense" && music.currentMusic != 'intense'){
        music.currentMusic = 'intense';
        music.gainB.gain.linearRampToValueAtTime(musicVolume * sfxBoard['downthedrain'].volume, audioContext.currentTime + 4);
        music.gainA.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    }
}

var sfxVolume = 0.5;
var lastSfxVolume = 0.5;
var sfxMuted = false;

var sfxBoard = {};
var audioContext = 'not started';
var bufferLoader;
function initiateAudioContext(){
    if(audioContext == 'not started'){
        try {
            audioContext = new AudioContext();
            loadSounds(sounds_to_load,function(){
                bounceGirl.audioConfirmed = true;
            });
        }
        catch(e) {
            audioContext = false;
            alert('Web Audio API is not supported in this browser');
        }
    }
    else {
        audioContext = false;
    }
}

function playSound(type, volume){
    if(!volume){
        volume = 1;
    }
    if(audioContext && audioContext != 'not started'){
        let sound = audioContext.createBufferSource();
        sound.buffer = sfxBoard[type].buffer;
        let soundGain = audioContext.createGain();
        soundGain.gain.value = sfxBoard[type].volume * sfxVolume * volume;
        sound.connect(soundGain).connect(audioContext.destination);
        sound.start();
    }
}

function handleGameEvent(event){
    if(event == 'round_start'){
        playSound('click');
    }
    if(event == 'game_started'){
        playSound('gamestart');
    }
    if(event == 'turn_given_up'){
        playSound('fail');
        window.clearInterval(roundTimer);
        roundTimer = "none";
        $("#timeBar").removeClass('flash');
    }
    if(event == 'turn_next'){
        window.clearInterval(roundTimer);
        roundTimer = "none";
        $("#timeBar").removeClass('flash');
    }
    if(event == 'half_points'){
        playSound('half_win');
    }
    if(event == 'full_points'){
        playSound('full_win');
    }
    if(event == 'round_started'){
        playSound('ding');
    }
    if(event == 'game_over'){
        playSound('game_over');
        window.clearInterval(roundTimer);
        roundTimer = "none";
        $("#timeBar").removeClass('flash');
    }
}

function loadSounds(soundsToLoad, callback){
    let soundsLoaded = 0;
    for(let i = 0; i < soundsToLoad.length; i++){
        loadSound(soundsToLoad[i][1], soundsToLoad[i][0], soundsToLoad[i][2]);
    }
    function loadSound(url, sourceName, volume) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            // Asynchronously decode the audio file data
            audioContext.decodeAudioData(
                request.response,
                function(buffer) {
                    if (!buffer) {
                        console.log('error decoding file data: ' + url);
                        return;
                    }
                        soundsLoaded++;
                        sfxBoard[sourceName] = {buffer: buffer, volume: volume};
                        if(soundsLoaded == soundsToLoad.length){
                            callback();
                        }
                }
            );
        }

        request.onerror = function() {
            console.log('error loading file data: ' + url);
        }

        request.send();
    }
}
