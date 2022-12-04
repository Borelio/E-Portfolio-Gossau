const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const { Server } = require("socket.io");
const { Car } = require('./car');
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

let possibleColors = ['blue', 'yellow', 'green', 'red'];
let cars = [];

io.on('connection', (socket) => {
    newPlayer(socket.id);
    let car = cars.find(car => car.playerId === socket.id);
    let posiontCode = car.color[0];

    socket.on('disconnect', () => {
        playerDisconnected(socket.id);
    });

    socket.on('p', (msg) => {
        socket.broadcast.emit(posiontCode, msg);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

function newPlayer(playerId) {
    if (cars.length < possibleColors.length) {
        let color = possibleColors.find(color => !cars.find(car => car.color === color));
        let car = new Car(playerId, color, 0, 0, 0);
        cars.push(car);

        setTimeout(() => {
            io.emit('playercarmap', playerId, color);
        }, 500);
    }
}

function playerDisconnected(playerId) {
    let car = cars.find(c => c.playerId == playerId);
    cars = cars.filter(car => car.playerId !== playerId);

    io.emit('deleteCar', car.color);
}