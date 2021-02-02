const path = require('path')
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js')

const app = express();
//  Create a web server using the http library and not Express
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '/public')

app.use(express.static(publicDirectory));

//  Runs when a client connects
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if(error){
            return callback(error)
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('System', 'Welcome'));

        //  Sends to everyone except the client emitting
        socket.broadcast.to(user.room).emit('message', generateMessage('System', `${user.username} has joined!`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    
    })

    socket.on('sendMessage', (message, callback) => {
        //  Check if message is empty and don't send
        const filter = new Filter()
        const user = getUser(socket.id);

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('System', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log(`Chat application running on port ${port}`)
})