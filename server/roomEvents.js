module.exports = (io, socket) => {
    function helloWorld(data){
        console.log(data)
    }

    socket.on("hello", helloWorld)
}