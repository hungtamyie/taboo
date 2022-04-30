module.exports = (io, socket, gameLobbies) => {
    function helloWorld(data){
        console.log(data)
    }

    socket.on("hello", helloWorld)
}