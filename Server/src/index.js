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

    let date = new Date();

    let options = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    console.log(date.toLocaleDateString('de-CH', options) + ' A user connected');
});

app.post('/redirect/all', (req, res) => {
    if (!req.query.hasOwnProperty('key') || !req.query.hasOwnProperty('url') || req.query.key !== config.API_KEY) {
        res.send('Nope');
        return;
    }

    io.emit('redirect', req.query.url);

    res.send('Okay');
});

const firstOverrideOption = {
    "mainImage": "https://www.lto.de/fileadmin/_processed_/8/c/csm_mittelfinger_535_d949ed423d.jpg",
    "image1": "assets/images/picture1.jpg",
    "image1Edited": "https://t3.ftcdn.net/jpg/00/26/10/38/360_F_26103851_7ncChqQJfxvwjsvTUXJYI2EpaVpX7M84.jpg",
    "image2": "assets/images/picture2.jpg",
    "image2Edited": "https://www.imago-images.de/bild/st/0116849452/s.jpg",
    "image3": "assets/images/picture3.jpg",
    "image3Edited": "https://st.depositphotos.com/1049680/2347/i/600/depositphotos_23474076-stock-photo-human-hand-gesturing-with-middle.jpg",
    "whyText": "Ich hasse es",
    "gameText": "Ich mag jedoch mein Game xD"
};
const seccondOverrideOption = {
    "mainImage": "assets/images/picture1_small.jpg",
    "image1": "assets/images/picture1.jpg",
    "image1Edited": "assets/images/picture1_edited.jpg",
    "image2": "assets/images/picture2.jpg",
    "image2Edited": "assets/images/picture2_edited.jpg",
    "image3": "assets/images/picture3.jpg",
    "image3Edited": "assets/images/picture3_edited.jpg"
};
const thirdOverrideOption = {
    "mainImage": "assets/images/picture1_small.jpg",
    "image1": "assets/images/picture1.jpg",
    "image1Edited": "assets/images/picture1_edited.jpg",
    "image2": "assets/images/picture2.jpg",
    "image2Edited": "assets/images/picture2_edited.jpg",
    "image3": "assets/images/picture3.jpg",
    "image3Edited": "assets/images/picture3_edited.jpg"
};

let setOverrideAction = 0;
app.get('/overrideUrls', (req, res) => {
    switch (setOverrideAction) {
        case 1:
            res.json(firstOverrideOption);
            break;
        case 2:
            res.json(seccondOverrideOption);
            break;
        case 3:
            res.json(thirdOverrideOption);
            break;
        default:
            res.json({});
            break;
    }

    //"extraScriptCode": "https://gossau-extension.nussmueller.dev/stupidscript.js"
});

app.post('/setoverrideaction', (req, res) => {
    if (!req.query.hasOwnProperty('key') || req.query.key !== config.API_KEY) {
        res.send('Nope');
        return;
    }

    if (req.query.hasOwnProperty('nr') && !Number.isNaN(req.query.nr)) {
        setOverrideAction = req.query.nr;
        res.send('Okay');
    } else {
        console.log('Querry not found');
        console.log(req.query.hasOwnProperty('nr'));
        console.log(req.query.nr);
        console.log(!Number.isNaN(req.query.nr));
        console.log('----------------------------');
        res.send('Nope sry');
    }
});

app.post('/resetoverride', (req, res) => {
    if (!req.query.hasOwnProperty('key') || req.query.key !== config.API_KEY) {
        res.send('Nope');
        return;
    }

    setOverrideAction = 0;
    res.send('Okay');
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