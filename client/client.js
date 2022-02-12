var socket = io();

function setName(name){
    var newName = name;
    socket.emit('set_name', {newName: newName});
}

function joinRoom(){
    var roomName = document.getElementById('roomInput').value.toUpperCase();
    socket.emit('join_room', {roomName: roomName});
}

function createRoom(){
    socket.emit('create_room', {});
}

socket.on('create_request_fulfilled', function(data){
    document.getElementById("roomName").innerHTML = 'Code: ' + data.roomName;
})

socket.on('room_occupancy', function(data){
    
    document.getElementById("teacherName").innerHTML = data.teacherName;
    if(data.teacherName.charAt(data.teacherName - 1) == 's'){
        document.getElementById("teacherName").innerHTML += "' Class";
    }
    else {
        document.getElementById("teacherName").innerHTML += "'s Class";
    }
    document.getElementById("studentCount").innerHTML = data.studentCount + ' students in room';
    document.getElementById("studentTable").innerHTML = "<colgroup><col style='width:40%'><col style='width:40%'><col style='width:20%'></colgroup><thead><tr><th>Name</th><th>Working on</th><th>Quizzes Passed</th></tr></thead><tbody>";
    let studentList = data.studentList;
    for(let i = 0; i < studentList.length; i++){
        let student = studentList[i];
        document.getElementById("studentTable").innerHTML += "<tr><td>" + student.name + "</td><td>" + student.currentAction + "</td><td>" + student.quizzesPassed + "</td></tr>";
    }
    if(studentList.length == 0){
        document.getElementById("studentTable").innerHTML += "<tr><td>...</td><td>...</td><td>...</td></tr>";
    }
    document.getElementById("studentTable").innerHTML += "</tbody>";
})

socket.on('student_result', function(data){
    console.log(data)
})

socket.on('error_feedback', function(data){
    console.log(data.error);
})

function sendGameUpdateMessage(){
    socket.emit('game_update', {type: 'test', info: 'jaime lili bcp'});
}