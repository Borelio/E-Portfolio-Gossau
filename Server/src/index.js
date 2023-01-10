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

const options = [
    {
        "mainImage": "https://www.lto.de/fileadmin/_processed_/8/c/csm_mittelfinger_535_d949ed423d.jpg",
        "image1": "assets/images/picture1.jpg",
        "image1Edited": "https://t3.ftcdn.net/jpg/00/26/10/38/360_F_26103851_7ncChqQJfxvwjsvTUXJYI2EpaVpX7M84.jpg",
        "image2": "assets/images/picture2.jpg",
        "image2Edited": "https://www.imago-images.de/bild/st/0116849452/s.jpg",
        "image3": "assets/images/picture3.jpg",
        "image3Edited": "https://st.depositphotos.com/1049680/2347/i/600/depositphotos_23474076-stock-photo-human-hand-gesturing-with-middle.jpg",
        "whyText": "Ich hasse es",
        "gameText": "Ich mag jedoch mein Game xD",
        "kaboomSound": "https://gossau-extension.nussmueller.dev/im-karton.mp3",
        "honkSound": "https://gossau-extension.nussmueller.dev/aaaa.mp3",
        "videoIframeCode": '<iframe width="1280" height="720" src="https://www.youtube.com/embed/eEa3vDXatXg" title="Why are u gae????" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
    },
    {
        "mainImage": "https://www.plantura.garden/wp-content/uploads/2017/03/baobabbaum.jpg",
        "image1": "https://www.baumpflegeportal.de/wp-content/uploads/2016/05/160509_Starke-Baumtypen_Eiche-im-Seidengewand_03.jpg",
        "image1Edited": "https://www.baumpflegeportal.de/wp-content/uploads/2016/05/160509_Starke-Baumtypen_Eiche-im-Seidengewand_02.jpg",
        "image2": "https://www.lamodula.at/media/magefan_blog/esche-holz-baum-1_2_.jpeg",
        "image2Edited": "https://www.plantura.garden/wp-content/uploads/2017/03/baobabbaum.jpg",
        "image3": "https://images.squarespace-cdn.com/content/v1/60472827fe54df702f7eb4c7/1617090977550-OBXG6PPUEXFZE47TBMQB/was-kostet-ein-baum-sommerlinde-2-baumschule-oekoplant-wels.jpg",
        "image3Edited": "https://www.waldwissen.net/assets/waldwirtschaft/schaden/trockenheit/wsl_baumartenwahl_trockenheit/wsl_baumartenwahl_trockenheit_waldfoehre.jpeg",
        "whyText": "Bäum sind halt scho cool und de anderi Nico het das jo scho guet zeiget mit sinere Siite xD",
        "gameText": "Leider han ich keis Game mit Bäum aber defür mit Autos",
        "kaboomSound": "https://gossau-extension.nussmueller.dev/Kettensäge.mp3",
        "honkSound": "https://gossau-extension.nussmueller.dev/BaumKaputt.mp3",
        "videoIframeCode": '<iframe width="1280" height="960" src="https://www.youtube.com/embed/2GMU58e60x4" title="Hermann Schönbächler best of" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
    },
    {
        "forceRedirect": "https://gossau.nussmueller.dev/"
    },
    {
        "forceRedirect": "http://www.austrasse20.ch/Familienfasnacht/"
    },
    {
        "forceRedirect": "http://www.austrasse20.ch/cgi-bin/gb.php?id=3124"
    }
];

let setOverrideAction = 0;
app.get('/overrideUrls', (req, res) => {
    if (setOverrideAction === 0) {
        res.json({});
    } else {
        res.json(options[setOverrideAction]);
    }

    //"extraScriptCode": "https://gossau-extension.nussmueller.dev/stupidscript.js"
});

app.post('/setoverrideaction', (req, res) => {
    if (!req.query.hasOwnProperty('key') || req.query.key !== config.API_KEY) {
        res.send('Nope');
        return;
    }

    if (req.query.hasOwnProperty('nr') && +req.query.nr > 0 && +req.query.nr < options.length) {
        setOverrideAction = +req.query.nr;
        io.emit('reloadUrls');
        res.send('Okay');
    } else {
        res.send('Nope sry');
    }
});

app.post('/resetoverride', (req, res) => {
    if (!req.query.hasOwnProperty('key') || req.query.key !== config.API_KEY) {
        res.send('Nope');
        return;
    }

    setOverrideAction = 0;
    io.emit('reloadUrls');
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