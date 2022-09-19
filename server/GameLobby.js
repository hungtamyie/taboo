const questionData = require("./questionData") 
const Utility = require("./utility");
const utility = new Utility;
class GameLobby {
    constructor(lobbyId){
        this.playerSockets = {};
        this.hostId = "";
        this.lobbyId = lobbyId;
        this.teamData = {
            A: {
                name: "Team A",
                points: 0,
                describerPointer: 0,
                players: [],
                pointScorers: {},
            },
            B: {
                name: "Team B",
                points: 0,
                describerPointer: 0,
                players: [],
                pointScorers: {},
            }
        };
        this.bannedPlayersIPs = [];
        this.rejoinIPs = [];
        this.state = "Lobby"; //Turn Start, Choosing Image, In Round, Game Over, Transition, Round End
        this.stateStartTimestamp = Date.now();
        this.extraTime = 'none';
        this.turnData = {
            currentTurn: 0,
            currentTeam: 'A',
            currentRound: 0,
            bestGuess: '',
            timeThisRound: 18,
            guesses: {},
            questionPresentationOrder: [],
            currentQuestionIndex: 0,
            questions: [],
        };
        this.questionPool = {};
        this.generateQuestionPool();
    }
    generateQuestionPool(){
        this.questionPool = {easy: [], medium: [], hard: []};
        for(let i = 0; i < questionData.easy.length; i++){this.questionPool.easy.push(i)}
        for(let i = 0; i < questionData.medium.length; i++){this.questionPool.medium.push(i)}
        for(let i = 0; i < questionData.hard.length; i++){this.questionPool.hard.push(i)}
    }
    startGame(){
        if(this.teamData.A.players.length < 2){
            this.turnData.currentTeam = 'B';
        }
        this.sendEventToAllSockets('game_started');
        this.state = "Turn Start";
    }
    updateStateStartTimestamp(){
        this.stateStartTimestamp = Date.now();
    }
    updateCurrentQuestion(q){
        if(this.state == 'Choosing Image'){
            if(q == 'left'){
                this.turnData.currentQuestionIndex = 0;
                this.turnData.questions[this.turnData.currentRound][0].chosen = true;
                this.turnData.questions[this.turnData.currentRound][1].chosen = false;
            }
            else {
                this.turnData.currentQuestionIndex = 1;
                this.turnData.questions[this.turnData.currentRound][0].chosen = false;
                this.turnData.questions[this.turnData.currentRound][1].chosen = true;
            }
            this.state = 'In Round';
            this.updateStateStartTimestamp()
            this.sendUpdateToAllSockets()
            this.sendEventToAllSockets('round_started');
        }
    }
    update(){
        //This is a function that will constantly run.
        if(this.state == 'Choosing Image'){
            if(Date.now() - this.stateStartTimestamp > 5500){
                this.state = 'In Round';
                if(Math.random() < 0.5){
                    this.turnData.currentQuestionIndex = 0;
                    this.turnData.questions[this.turnData.currentRound][0].chosen = true;
                    this.turnData.questions[this.turnData.currentRound][1].chosen = false;
                }
                else {
                    this.turnData.currentQuestionIndex = 1;
                    this.turnData.questions[this.turnData.currentRound][0].chosen = false;
                    this.turnData.questions[this.turnData.currentRound][1].chosen = true;
                }

                this.updateStateStartTimestamp()
                this.sendUpdateToAllSockets()
                this.sendEventToAllSockets('round_started');
            }
        }
        if(this.state == 'In Round'){
            if(Date.now() - this.stateStartTimestamp > this.turnData.timeThisRound * 1000){
                let currentQuestion = this.turnData.questions[this.turnData.currentRound][this.turnData.currentQuestionIndex]
                if(currentQuestion.answered == 'no'){
                    this.sendEventToAllSockets('turn_given_up');
                }
                this.extraTime = 'none';
                this.state = 'Round End';
                this.updateStateStartTimestamp();
                this.sendUpdateToAllSockets();
            }
        }
        if(this.state == 'Round End'){
            if(Date.now() - this.stateStartTimestamp > 2000){
                this.turnData.timeThisRound = 18;
                if(this.extraTime == 'none'){
                    this.nextRound(false);
                }
                else {
                    this.nextRound(true, this.extraTime);
                }
                this.updateStateStartTimestamp()
                this.sendUpdateToAllSockets()
            }
        }
        if(this.state == 'Transition'){
            if(Date.now() - this.stateStartTimestamp > 1500){
                this.nextTurn();
            }
        }
        if(this.state != 'Game Over'){
            if(this.teamData.A.points >= 250 || this.teamData.B.points >= 250 || this.turnData.currentTurn >= 10000){
                this.state = 'Game Over';
                this.sendUpdateToAllSockets();
                this.sendEventToAllSockets('game_over');
            }
        }
    }
    giveUp(){
        let currentQuestion = this.turnData.questions[this.turnData.currentRound][this.turnData.currentQuestionIndex]
        if(this.state == 'In Round' && currentQuestion.answered == 'no'){
            this.sendEventToAllSockets('turn_given_up');
            this.updateStateStartTimestamp()
            this.turnData.timeThisRound = 18;
            this.extraTime =  'none';
            this.state = 'Round End';
            this.updateStateStartTimestamp();
            this.sendUpdateToAllSockets();
        }
    }
    nextQuestion(){
        let currentQuestion = this.turnData.questions[this.turnData.currentRound][this.turnData.currentQuestionIndex]
        if(this.state == 'In Round' && (currentQuestion.answered == 'yes' || currentQuestion.answered == 'half')){
            this.sendEventToAllSockets('turn_next');
            let extraTime = Math.floor(this.turnData.timeThisRound - ((Date.now() - this.stateStartTimestamp)/1000))
            this.turnData.timeThisRound = 18 + extraTime;
            this.extraTime =  extraTime;
            this.state = 'Round End';
            this.updateStateStartTimestamp();
            this.sendUpdateToAllSockets();
        }
    }
    sendUpdateToAllSockets(){
        let currentState = this.toJSON()
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                this.playerSockets[key].emit("game_update", {currentState: currentState})
            }
        }
    }
    sendEventToAllSockets(event){
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                this.playerSockets[key].emit("game_event", {event: event});
            }
        }
    }
    sendChatMessageToAllSockets(name, message, team, id, playSound){
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                this.playerSockets[key].emit("chat_message", {name: name, message: message, team: team, id: id, playSound: playSound});
            }
        }
    }
    sendPreloadToAllSockets(){
        let imagesToPreload = this.getImagesToPreload();
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                this.playerSockets[key].emit("preload_request", {images: imagesToPreload})
            }
        }
    }
    loadTurn(){
        //If the current team is A, recreate the question presentation order array. Only on A because we want A and B to both be presented with the same questions
        if(this.turnData.currentTeam == 'A' || (this.teamData.A.players.length < 2)){
            this.turnData.questionPresentationOrder = [];
            for(let i = 0; i < 6; i++){
                let randomA = Math.random();
                if(randomA > 0.8) randomA = "hard";
                else if(randomA > 0.4) randomA = "medium"
                else randomA = "easy";

                let randomB = Math.random();
                if(randomB > 0.8) randomB = "hard";
                else if(randomB > 0.4) randomB = "medium" 
                else randomB = "easy";
                
                //90% chance to get different difficulties for the two choices
                if(randomA == randomB && Math.random() < 0.9){
                    if(randomA == 'easy') randomB = 'medium'
                    else if(randomA == 'medium') randomB = 'hard'
                    else randomB = 'easy'
                }
                if(i == 5){
                    if(randomA == 'easy') randomA == 'medium';
                }

                this.turnData.questionPresentationOrder.push([randomA, randomB])
            }
        }
        this.turnData.questions = [];
        let pointTable = {'easy': 12, 'medium': 16, 'hard': 20}
        for(let i = 0; i < 6; i++){
            let questionTypeA = this.turnData.questionPresentationOrder[i][0];
            let questionTypeB = this.turnData.questionPresentationOrder[i][1];
            
            if(this.questionPool.easy.length <= 2 || this.questionPool.medium.length <= 2 || this.questionPool.hard.length <= 2){
                this.generateQuestionPool();
            }

            //console.log("this.questionPool[questionTypeA]" + this.questionPool[questionTypeA])
            //console.log("")
            //console.log(this.questionPool[questionTypeA].splice(Math.floor(Math.random()*this.questionPool[questionTypeA].length),1))
            let questionA = JSON.parse(JSON.stringify(questionData[questionTypeA][Number(this.questionPool[questionTypeA].splice(Math.floor(Math.random()*this.questionPool[questionTypeA].length),1)[0])]))
            questionA.answered = 'no';
            questionA.pointValue = pointTable[questionTypeA]
            let questionB = JSON.parse(JSON.stringify(questionData[questionTypeB][Number(this.questionPool[questionTypeB].splice(Math.floor(Math.random()*this.questionPool[questionTypeB].length),1)[0])]))
            questionB.answered = 'no';
            questionB.pointValue = pointTable[questionTypeB]

            if(i==5){
                questionA.pointValue *= 2;
                questionB.pointValue *= 2;
            }
            this.turnData.questions.push([questionA, questionB])
        }
        this.sendPreloadToAllSockets()
        //console.log('turn loaded')
    }
    getImagesToPreload(){
        let images = [];
        for(let i = 0; i < this.turnData.questions.length; i++){
            images.push(this.turnData.questions[i][0].url)
            images.push(this.turnData.questions[i][1].url)
        }
        return images;
    }
    startRound(){
        this.updateStateStartTimestamp();
        this.state = 'Choosing Image';
    }
    nextTurn(){
        this.state = "Turn Start";
        //Switch current team
        this.turnData.currentTeam = (this.turnData.currentTeam == 'A') ? 'B' : 'A';
        //If team is empty go back
        if(this.teamData[this.turnData.currentTeam].players.length == 0){
            this.turnData.currentTeam = (this.turnData.currentTeam == 'A') ? 'B' : 'A';
        }
        this.turnData.currentRound = 0;
        this.turnData.currentQuestion = 0;
        this.turnData.timeThisRound = 18;
        this.turnData.bestGuess = '';
        this.turnData.guesses = {};
        this.turnData.currentQuestionIndex = 0;
        this.turnData.currentTurn++;
        this.nextDescriber();
        this.updateStateStartTimestamp();
        this.loadTurn();
        this.sendUpdateToAllSockets();
    }
    nextRound(haveExtraTime, extraTime){
        this.turnData.currentRound++;
        if(this.turnData.currentRound > 5){
            this.state = "Transition";
            this.updateStateStartTimestamp();
            this.turnData.currentRound = 6;
        }
        else if(this.turnData.currentRound == 5 && !haveExtraTime){
            this.state = "Transition";
            this.updateStateStartTimestamp();
            this.turnData.currentRound = 5;
        }
        else if(this.turnData.currentRound == 5 && haveExtraTime){
            this.turnData.timeThisRound = extraTime + 5;
            this.turnData.bestGuess = '';
            this.turnData.guesses = {};
            this.turnData.currentQuestionIndex = 0;
            this.updateStateStartTimestamp();
            this.state = 'Choosing Image';
        }
        else {
            this.turnData.bestGuess = '';
            this.turnData.guesses = {};
            if(haveExtraTime){
                this.turnData.timeThisRound = 18 + extraTime;
            } 
            else {
                this.turnData.timeThisRound = 18;
            };
            this.turnData.currentQuestionIndex = 0;
            this.updateStateStartTimestamp();
            this.state = 'Choosing Image';
        }
    }
    getCurrentDescriberID(){
        let team = this.teamData[this.turnData.currentTeam];
        return team.players[team.describerPointer];
    }
    nextDescriber(){
        let team = this.teamData[this.turnData.currentTeam];
        team.describerPointer++;
        if(!team.players[team.describerPointer]){
            team.describerPointer = 0;
        }
    }
    isGuesser(id){
        let team = this.teamData[this.turnData.currentTeam];
        //Must be on the correct team and not be the describer
        if(team.players.includes(id) && id != this.getCurrentDescriberID()){
            return true;
        }
        else {
            return false;
        }
    }
    submitGuess(id, guess){
        let escapedGuess = guess;
        escapedGuess = escapedGuess.replace(/&/g, '&amp;');
        escapedGuess = escapedGuess.replace(/</g, '&lt;');
        escapedGuess = escapedGuess.replace(/>/g, '&gt;');
        this.turnData.guesses[id] = {guess: guess, escapedGuess: escapedGuess};

        let currentQuestion = this.turnData.questions[this.turnData.currentRound][this.turnData.currentQuestionIndex]
        let answer = currentQuestion.name;
        let guessString = guess.toLowerCase().replace(/(^the )/gi, "")
        let answerString = answer.toLowerCase().replace(/(^the )/gi, "")
        let guessCorrectness = Infinity;
        guessCorrectness = utility.levenshteinDistance(guessString, answerString);
        let succeeded = false;

        let matchedAlias = "no";
        if(currentQuestion.alias){
            let maxAliasCorrectness = Infinity;
            let bestAlias = '';
            for(let i = 0; i < currentQuestion.alias.length; i++){
                let aliasString = currentQuestion.alias[i].toLowerCase().replace(/(^the )/gi, "")
                let aliasCorrectness = utility.levenshteinDistance(guessString, aliasString);
                if(aliasCorrectness < maxAliasCorrectness){
                    bestAlias = aliasString;
                    maxAliasCorrectness = aliasCorrectness;
                }
            }
            console.log(bestAlias)
            console.log(maxAliasCorrectness)
            if(maxAliasCorrectness == 0){
                matchedAlias = 'yes'
            }
            else if(maxAliasCorrectness < bestAlias.length/2 - 1){
                matchedAlias = 'half'
            }
        }

        if(utility.levenshteinDistance(this.turnData.bestGuess.toLowerCase().replace(/(^the )/gi, ""), answerString) != 0){
            //IMPORTANT LINE
            if(guessCorrectness < answerString.length/2 - 1 || matchedAlias == 'half'){
                this.turnData.bestGuess = guess;
                if(currentQuestion.answered == 'no'){
                    this.sendEventToAllSockets('half_points');
                    succeeded = true;
                    this.teamData[this.turnData.currentTeam].points += currentQuestion.pointValue/2;
                    this.recordPoints(this.turnData.currentTeam, id, currentQuestion.pointValue/2)
                }
                currentQuestion.answered = 'half';
            }
            if(guessCorrectness == 0 || matchedAlias == 'yes'){
                this.turnData.bestGuess = guess;
                this.sendEventToAllSockets('full_points');
                succeeded = true;
                if(currentQuestion.answered == 'half'){
                    this.teamData[this.turnData.currentTeam].points += currentQuestion.pointValue/2;
                    this.recordPoints(this.turnData.currentTeam, id, currentQuestion.pointValue/2)
                }
                else {
                    this.teamData[this.turnData.currentTeam].points += currentQuestion.pointValue;
                    this.recordPoints(this.turnData.currentTeam, id, currentQuestion.pointValue)
                }
                currentQuestion.answered = 'yes';
            }
        }
        
        this.sendChatMessageToAllSockets(this.playerSockets[id].data.username, escapedGuess, this.turnData.currentTeam, id, (!succeeded));
    }
    recordPoints(team, playerId, points){
        let name = this.playerSockets[playerId].data.username;
        if(this.teamData[team].pointScorers[name] != undefined){
            this.teamData[team].pointScorers[name] += points;
        }
        else {
            this.teamData[team].pointScorers[name] = points;
        }
    }
    shuffleTeams(){
        this.teamData["A"].players = [];
        this.teamData["B"].players = [];
        let playerIds = [];
        //Fill player ids
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                playerIds.push(this.playerSockets[key].id);
            }
        }
        //Shuffle player ids
        for (let i = playerIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
        }
        //Put them shuffled into the team data arrays
        let start = Math.floor(Math.random()+0.5);
        for(let i = 0; i < playerIds.length; i++){
            if((i+start)%2==0){
                this.teamData["A"].players.push(playerIds[i])
            }
            else {
                this.teamData["B"].players.push(playerIds[i])
            }
        }
    }
    setTeamNames(A,B){
        this.teamData.A.name = A;
        this.teamData.B.name = B;
    }
    addPlayerSocket(socket){
        this.playerSockets[socket.id] = socket;
        return true;
    }
    removePlayerSocketId(socketId){
        let whichTeam;
        let otherTeam;
        let currentTeam = this.teamData[this.turnData.currentTeam];
        let describerId = currentTeam.players[currentTeam.describerPointer];
        //Removes the player socket
        delete this.playerSockets[socketId];
        for(let i = 0; i < this.teamData["A"].players.length; i++){
            if(this.teamData["A"].players[i] == socketId){
                this.teamData["A"].players.splice(i,1);
                whichTeam = 'A';
                otherTeam = 'B';
            }
        }
        for(let i = 0; i < this.teamData["B"].players.length; i++){
            if(this.teamData["B"].players[i] == socketId){
                this.teamData["B"].players.splice(i,1);
                whichTeam = 'B';
                otherTeam = 'A';
            }
        }
        //Removes them as host
        if(socketId == this.hostId){
            if(Object.keys(this.playerSockets).length > 0){
                this.hostId = this.playerSockets[Object.keys(this.playerSockets)[0]].id;
            }
        }
        //Deals with any possible problems that could arise from them being gone
        if(whichTeam && this.teamData[whichTeam].players.length == 0 && this.turnData.currentTeam == whichTeam && this.state == 'Turn Start'){
            this.nextTurn();
        }
        if(describerId == socketId){
            let team = this.teamData[this.turnData.currentTeam];
            if(!team.players[team.describerPointer]){
                team.describerPointer = 0;
            }
            if(this.state == 'In Round'){
                let currentQuestion = this.turnData.questions[this.turnData.currentRound][this.turnData.currentQuestionIndex]
                if(currentQuestion.answered == 'no'){
                    this.sendEventToAllSockets('turn_given_up');
                }
                this.extraTime = 'none';
                this.state = 'Round End';
                this.updateStateStartTimestamp();
                this.sendUpdateToAllSockets();
            }
            else if(this.state == 'Choosing Image'){
                if(Date.now() - this.stateStartTimestamp > 5500){
                    this.state = 'Turn Start'
                    this.updateStateStartTimestamp()
                    this.sendUpdateToAllSockets()
                }
            }
        }
    }
    banPlayer(ip){
        this.bannedPlayersIPs.push(ip);
    }
    playerIsBanned(socket){
        return this.bannedPlayersIPs.includes(socket.data.address);
    }
    setHostId(hostId){
        this.hostId = hostId;
    }
    setPlayerTeam(socket, team){
        if(this.teamData[team].players.includes(socket.id)){
            for(let i = 0; i < this.teamData.A.players.length; i++){
                if(this.teamData.A.players[i]== socket.id){
                    this.teamData.A.players.splice(i,1);
                }
            }
            for(let i = 0; i < this.teamData.B.players.length; i++){
                if(this.teamData.B.players[i]== socket.id){
                    this.teamData.B.players.splice(i,1);
                }
            }
            return false;
        };
        this.teamData[team].players.unshift(socket.id);
        let otherTeam = team == "A" ? "B" : "A";
        for(let i = 0; i < this.teamData[otherTeam].players.length; i++){
            if(this.teamData[otherTeam].players[i]== socket.id){
                this.teamData[otherTeam].players.splice(i,1);
            }
        }
        return true;
    }
    toJSON(){
        let playerSocketsJSON = {};
        for (const key in this.playerSockets) {
            if (this.playerSockets.hasOwnProperty(key)) {
                playerSocketsJSON[key] = {name: this.playerSockets[key].data.username, id: this.playerSockets[key].id};
            }
        }
        return {
            playerSockets: playerSocketsJSON,
            teamData: this.teamData,
            lobbyId: this.lobbyId,
            turnData: this.turnData,
            hostId: this.hostId,
            extraTime: this.extraTime,
            state: this.state,
            stateStartTimestamp: this.stateStartTimestamp
        };
    }
}

module.exports = GameLobby;