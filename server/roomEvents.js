module.exports = (io, socket) => {
    const helloWorld = (data) => {
        console.log(data)
    }

    socket.on("hello", helloWorld)
}