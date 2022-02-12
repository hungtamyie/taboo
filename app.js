var express = require('express');
var app = express();
var serv = require('http').Server(app);
const port = 2000;

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'))

serv.listen(port, function(error) {
    if(error) {
        console.log('Something went wrong', error)
    }
    else {
        console.log('Server is listening on port ' + port)
    }
});

var clients = [];
var rooms = {};

var io = require('socket.io')(serv, {'pingInterval': 2000, 'pingTimeout': 5000});
io.sockets.on('connection', function(socket){
    //Establish information about socket.
    socket.sessionData = {};
    socket.sessionData.room = '!no_room';
    socket.sessionData.name = '!no_name';
    socket.sessionData.currentAction = 'Main Menu'
    socket.sessionData.quizzesPassed = 0;
    clients.push(socket);
    console.log(socket.id + " connected");

    //Define socket behavior
    socket.on('set_name', function(data){
        if(socket.sessionData.name == '!no_name'){
            socket.sessionData.name = data.newName;
        }
    })
    
    socket.on('join_room', function(data){
        if(socket.sessionData.name == '!no_name'){
            socket.emit('error_feedback', {error: 'You must first set a name.'});
            return;
        }
        if(socket.sessionData.room != '!no_room'){
            socket.emit('error_feedback', {error: 'You are already in a room.'});
            return;
        }

        if(typeof(rooms[data.roomName]) != 'undefined' && typeof(rooms[data.roomName].teacher) != 'undefined'){
            console.log('Room ' + data.roomName + ' has been joined by ' + socket.id);
            socket.sessionData.room = data.roomName;
            rooms[data.roomName].students.push(socket);
        }
        else {
            console.log(socket.id + ' tried to join a room that doesnt exist')
        }
    })

    socket.on('create_room', function(data){

        //Get a random room name GUARANTEED not to exist wowowoww what a programmer
        var randomRoomName = '';
        do {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var charactersLength = characters.length;
            for ( var i = 0; i < 5; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * 
            charactersLength));
            }
            randomRoomName = result;
        } while(typeof(rooms[randomRoomName]) != 'undefined')
        //Create the room
        socket.sessionData.room = randomRoomName;
        rooms[randomRoomName] = {teacher: socket, students: []};
        socket.emit('create_request_fulfilled', {roomName: randomRoomName});
        console.log('New room created: ' + randomRoomName);
    })

    socket.on('disconnect', function() { 
        console.log(socket.id + ' disconnected');
        cleanDisconnect(socket);
        //clients.splice(clients.indexOf(socket), 1);
        //remove user from db
    });
})

function cleanDisconnect(socket){
    //should destroy/leave a room
    kickFromRoom(socket);
    clients.splice(clients.indexOf(socket), 1);
}

function kickFromRoom(socket){
    if(socket.sessionData.room != "!no_room"){
        let currentRoom = rooms[socket.sessionData.room];
        if(currentRoom.teacher.id == socket.id){
            console.log("teacher left");
        }
        else {
            console.log("student left");
            for(let i = 0; i < currentRoom.students.length; i++){
                if(currentRoom.students[i].id == socket.id){
                    currentRoom.students.splice(i, 1);
                }
            }
        }
    }
}

function roomOccupancyUpdateLoop(){
    for (const room in rooms) {
        if (rooms.hasOwnProperty(room)) {
            let students = rooms[room].students;
            let studentList = [];
            let studentCount = 0;
            for(let i = 0; i < students.length; i++){
                let student = students[i].sessionData;
                studentCount++;
                studentList.push({name: student.name, quizzesPassed: student.quizzesPassed, currentAction: student.currentAction});
            }
            rooms[room].teacher.emit('room_occupancy', {teacherName: rooms[room].teacher.sessionData.name, studentCount: studentCount, studentList: studentList})
        }
    }
}
var roomOccupancyUpdateLoopInterval = setInterval(roomOccupancyUpdateLoop, 2000);