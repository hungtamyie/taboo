var socket = io();


//RECIEVING
socket.on('smth', function(data){
    //do something
})

//SENDING
socket.emit('something', "ef")


socket.emit('hello', 'world')

socket.onclose = function(){
    console.log("connection closed")
}

socket.addEventListener("error", function(){
    socket.close()
})
