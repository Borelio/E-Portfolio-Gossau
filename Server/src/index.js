const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

let cars = [];

io.on('connection', (socket) => {
    console.log('a user connected');
    console.log(socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('p', (msg) => {
        console.log('message: ' + msg);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});