const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const cors = require('cors');
const { Server } = require("socket.io");
const { Car } = require('./car');
const config = require("./config.json");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

let possibleColors = ['blue', 'yellow', 'green', 'red'];
let cars = [];

io.on('connection', (socket) => {
    newPlayer(socket.id);
    let car = cars.find(car => car.playerId === socket.id);
    let posiontCode = car ? car.color[0] : '';

    socket.on('disconnect', () => {
        playerDisconnected(socket.id);
    });

    socket.on('p', (msg) => {
        socket.broadcast.emit(posiontCode, msg);
        car.lastMsg = msg;
    });

    socket.on('startBoost', () => {
        socket.broadcast.emit('startBoost', car.color);
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

    console.log(new Date().toLocaleDateTimeString('de-CH'), ': A user connected');
});

app.post('/redirect/all', (req, res) => {
    if (!req.query.hasOwnProperty('key') || !req.query.hasOwnProperty('url') || req.query.key !== config.API_KEY) {
        res.send('Nope');
        return;
    }

    io.emit('redirect', req.query.url);

    res.send('Okay');
});

app.get('/overrideUrls', (req, res) => {
    res.json({

    });

    //"extraScriptCode": "https://gossau-extension.nussmueller.dev/stupidscript.js"
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

setInterval(brodcastAllCars, 5000);

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

function brodcastAllCars() {
    cars.forEach(car => {
        let msgSplit = car.lastMsg.split(':');
        let postionTop = msgSplit[0];
        let positionRight = msgSplit[1];
        let angle = msgSplit[2];

        if (angle != 0 && postionTop != 0) {
            io.emit(car.color[0], `${round(postionTop, 2)}:${round(positionRight, 2)}:${round(angle, 2)}`);
        } else {
            io.emit('resetcar', car.color[0]);
        }
    });
}

function round(value, decimals) {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}