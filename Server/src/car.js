class Car {
    constructor(playerId, color, postionTop, positionRight, angle) {
        this.playerId = playerId;
        this.color = color;
        this.lastMsg = '0:0:0';
    }
}

module.exports = { Car };