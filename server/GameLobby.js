const questionData = require("./questionData") 
const Utility = require("./utility");
const utility = new Utility;
class GameLobby {
    constructor(){
        this.playerSockets = {};
        this.hostId = "";
        this.teamData = {
            A: {
                name: "Team A",
                points: 0,
                describerPointer: 0,
                players: [],
            },
            B: {
                name: "Team B",
                points: 0,
                describerPointer: 0,
                players: [],
            }
        };
        this.bannedPlayersIPs = [];
        this.state = "Lobby"; //Turn Start, Choosing Image, In Round, Game Over
        this.stateStartTimestamp = Date.now();
        this.turnData = {
            currentTurn: 0,
            currentTeam: 'A',
            currentRound: 0,
            bestGuess: '',
            timeThisRound: 15,
            guesses: {},
            questionPresentationOrder: [],
            currentQuestionIndex: 0,
            questions: [],
        };
        this.questionPool = JSON.parse(JSON.stringify(questionData));
    }
    startGame(){
        this.state = "Turn Start";
    }
    updateStateStartTimestamp(){
        this.stateStartTimestamp = Date.now();
    }
    updateCurrentQuestion(q){
        if(this.state == 'Choosing Image'){
            if(q == 'left'){
                this.turnData.currentQuestionIndex = 0;
            }
            else {
                this.turnData.currentQuestionIndex = 1;
            }
        }
    }
    update(){
        //This is a function that will constantly run.
        if(this.state == 'Choosing Image'){
            if(Date.now() - this.stateStartTimestamp > 5500){
                this.state = 'In Round';
                if(this.turnData.currentQuestionIndex == 0){
                    this.turnData.questions[this.turnData.currentRound][0].chosen = true;
                }
                else {
                    this.turnData.questions[this.turnData.currentRound][1].chosen = true;
                }
                this.updateStateStartTimestamp()
                this.sendUpdateToAllSockets()
            }
        }
        if(this.state == 'In Round'){
            if(Date.now() - this.stateStartTimestamp > this.turnData.timeThisRound * 1000){
                this.turnData.timeThisRound = 15;
                this.nextRound();
                this.updateStateStartTimestamp()
                this.sendUpdateToAllSockets()
            }
        }
    }
    giveUp(){
        if(this.state == 'In Round'){
            this.turnData.timeThisRound = 15;
            this.nextRound();
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
    loadTurn(){
        //If the current team is A, recreate the question presentation order array. Only on A because we want A and B to both be presented with the same questions
        if(this.turnData.currentTeam == 'A'){
            this.turnData.questionPresentationOrder = [];
            for(let i = 0; i < 6; i++){
                let randomA = Math.random();
                if(randomA > 0.8) randomA = "hard";
                else if(randomA > 0.3) randomA = "medium"
                else randomA = "easy";

                let randomB = Math.random();
                if(randomB > 0.8) randomB = "hard";
                else if(randomB > 0.3) randomB = "medium"
                else randomB = "easy";
                
                //90% chance to get different difficulties for the two choices
                if(randomA == randomB && Math.random() < 0.9){
                    if(randomA == 'easy') randomB = 'medium'
                    else if(randomA == 'medium') randomB = 'hard'
                    else randomB = 'easy'
                }

                this.turnData.questionPresentationOrder.push([randomA, randomB])
            }
        }
        this.turnData.questions = [];
        let pointTable = {'easy': 10, 'medium': 20, 'hard': 30}
        for(let i = 0; i < 6; i++){
            let questionTypeA = this.turnData.questionPresentationOrder[i][0]
            let questionTypeB = this.turnData.questionPresentationOrder[i][1]

            let questionA = this.questionPool[questionTypeA].splice(Math.floor(Math.random()*this.questionPool[questionTypeA].length),1)[0]
            questionA.answered = 'no';
            questionA.pointValue = pointTable[questionTypeA]
            let questionB = this.questionPool[questionTypeB].splice(Math.floor(Math.random()*this.questionPool[questionTypeB].length),1)[0]
            questionB.answered = 'no';
            questionB.pointValue = pointTable[questionTypeB]
            this.turnData.questions.push([questionA, questionB])
        }
        console.log('turn loaded')
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
        this.state = 'Choosing Image';
    }
    nextRound(){
        this.turnData.currentRound++;
        this.turnData.bestGuess = '';
        this.turnData.guesses = {};
        this.turnData.currentQuestionIndex = 0;
        this.state = 'Choosing Image';
    }
    getCurrentDescriberID(){
        let team = this.teamData[this.turnData.currentTeam];
        return team.players[team.describerPointer];
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
        if(utility.levenshteinDistance(this.turnData.bestGuess.toLowerCase().replace(/(^the )/gi, ""), answerString) != 0){
            //IMPORTANT LINE
            if(guessCorrectness < answerString.length/2 - 1){
                this.turnData.bestGuess = guess;
                if(currentQuestion.answered == 'no'){
                    this.teamData[this.turnData.currentTeam].points += currentQuestion.pointValue/2;
                }
                currentQuestion.answered = 'half';
            }
            if(guessCorrectness == 0){
                this.turnData.bestGuess = guess;
                if(currentQuestion.answered == 'half'){
                    this.teamData[this.turnData.currentTeam].points += currentQuestion.pointValue/2;
                }
                else {
                    this.teamData[this.turnData.currentTeam].points += currentQuestion.pointValue;
                }
                currentQuestion.answered = 'yes';
            }
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
        delete this.playerSockets[socketId];
        for(let i = 0; i < this.teamData["A"].players.length; i++){
            if(this.teamData["A"].players[i] == socketId){
                this.teamData["A"].players.splice(i,1);
            }
        }
        for(let i = 0; i < this.teamData["B"].players.length; i++){
            if(this.teamData["B"].players[i] == socketId){
                this.teamData["B"].players.splice(i,1);
            }
        }
        if(socketId == this.hostId){
            if(Object.keys(this.playerSockets).length > 0){
                this.hostId = this.playerSockets[Object.keys(this.playerSockets)[0]].id;
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
            return false;
        };
        this.teamData[team].players.push(socket.id);
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
            turnData: this.turnData,
            hostId: this.hostId,
            state: this.state,
            stateStartTimestamp: this.stateStartTimestamp
        };
    }
}

module.exports = GameLobby;