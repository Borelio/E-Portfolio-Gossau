const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const { Server } = require("socket.io");
const { Car } = require('./car');
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let possibleColors = ['blue', 'yellow', 'green', 'red'];
let cars = [];

io.on('connection', (socket) => {
    newPlayer(socket.id);
    let car = cars.find(car => car.playerId === socket.id);
    let posiontCode = car?.color[0];

    socket.on('disconnect', () => {
        playerDisconnected(socket.id);
    });

    socket.on('p', (msg) => {
        socket.broadcast.emit(posiontCode, msg);
    });

    socket.on('honk', () => {
        socket.broadcast.emit('honk');
    });

    socket.on('crash', (msg) => {
        socket.broadcast.emit('crash', msg);
    });

    socket.on('requestcar', () => {
        newPlayer(socket.id);
        let newCar = cars.find(car => car.playerId === socket.id);
        if (newCar) {
            posiontCode = newCar.color[0];
            console.log('New Car: ' + newCar.color);
        } else {
            console.log('No new car found');
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');

    setInterval(() => {
        console.log('intervall');
        let socketIds = cars.map(car => car.playerId);
        cars.forEach(car => {
            if (car.positionTop !== 0 && car.angle !== 0) {
                socketIds.filter(x => car.playerId !== x).forEach(socketId => {
                    io.to(socketId).emit(car.color[0], `${round(car.postionTop, 2)}:${round(car.positionRight, 2)}:${round(car.angle, 2)}`);
                });
            }
        });
    }, 5000);
});

function newPlayer(playerId) {
    if (cars.find(car => car.playerId === playerId)) {
        let color = cars.find(car => car.playerId === playerId).color;
        io.emit('playercarmap', playerId, color);
        console.log('stupid');
        return;
    }

    if (cars.length < possibleColors.length) {
        let color = possibleColors.find(color => !cars.find(car => car.color === color));
        let car = new Car(playerId, color, 0, 0, 0);
        cars.push(car);

        setTimeout(() => {
            io.emit('playercarmap', playerId, color);
        }, 500);
    } else {
        console.log('No more cars available' + cars.length + possibleColors.length);
    }
}

function playerDisconnected(playerId) {
    let car = cars.find(c => c.playerId == playerId);
    cars = cars.filter(car => car.playerId !== playerId);

    if (car) {
        io.emit('deleteCar', car.color);
    }
}

function round(value, decimals) {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}