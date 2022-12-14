import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { Car, CarColor } from '../models/car';
import { Explosion } from '../models/explosion';
import { KeyBoard } from '../models/keyBoard';

@Injectable({
    providedIn: 'root',
})
export class RaceService {
    private readonly defaultMaxSpeed: number = 50;
    private readonly defaultAcceleration: number = 2;
    private readonly boostMaxSpeed: number = 100;
    private readonly boostAcceleration: number = 5;
    private readonly boostLenght: number = 2000;
    private readonly boostingTimeoutLength: number = 5000;
    readonly cars: Car[] = [
        new Car(CarColor.red),
        new Car(CarColor.blue),
        new Car(CarColor.green),
        new Car(CarColor.yellow),
    ];

    socket: Socket | undefined;
    myCar: Car | undefined;
    startedMovingOtherCars: boolean = false;
    requestCarIntervall: NodeJS.Timer | undefined;
    explosions: Explosion[] = [];
    keyBoard: KeyBoard = new KeyBoard();

    carsMaxSpeed: number = this.defaultMaxSpeed;
    carsAcceleration: number = this.defaultAcceleration;

    boostingTimeout: boolean = false;
    honkSoundPlaying: boolean = false;
    motorSoundPlaying: boolean = false;

    init(socket: Socket) {
        this.socket = socket;

        socket.on('playercarmap', (playerId: string, color: CarColor) => {
            if (playerId === socket.id) {
                this.myCar = this.cars.find((car) => car.color === color)!;
                clearInterval(this.requestCarIntervall);
            }
        });

        socket.on('deleteCar', (color: string) => {
            let car = this.cars.find((car) => car.color === color);
            this.resetCar(car!);
        });

        socket.on('honk', () => {
            this.playHonkSound();
        });

        socket.on('startBoost', (color: CarColor) => {
            this.boostOtherCar(color);
        });

        socket.on('crash', (data: string) => {
            let dataSplit = data.split(':');
            let positionTop = Number(dataSplit[0]);
            let positionRight = Number(dataSplit[1]);

            this.crashAnimation(positionTop, positionRight);
        });

        socket.on('redirect', (url: string) => {
            window.open(url, '_self');
        });
    }

    refreshView() {
        if (!this.startedMovingOtherCars && this.socket?.connected) {
            this.moveOtherCars();
        }

        if (this.startedMovingOtherCars && this.myCar) {
            this.doMovement(this.myCar!);
            this.detectCrash(this.myCar!);
        }
    }

    moveOtherCars() {
        this.startedMovingOtherCars = true;

        let colors: CarColor[] = [
            CarColor.red,
            CarColor.green,
            CarColor.blue,
            CarColor.yellow,
        ];

        colors.forEach((color) => {
            let car = this.cars.find((car) => car.color === color)!;
            let posiontCode = color[0];

            this.socket!.on(posiontCode, (data: string) => {
                if (!this.myCar || this.myCar?.color[0] !== posiontCode) {
                    let dataSplit = data.split(':');
                    let postionTopBevore = car.postionTop;
                    let postionRightBevore = car.postionRight;
                    let angleBevore = car.angle;

                    car.postionTop = Number(dataSplit[0]);
                    car.postionRight = Number(dataSplit[1]);
                    car.angle = Number(dataSplit[2]);

                    if (
                        postionTopBevore !== car.postionTop ||
                        postionRightBevore !== car.postionRight ||
                        angleBevore !== car.angle
                    ) {
                        this.playMotorSound();
                    }
                }
            });
        });

        this.socket!.on('resetcar', (posiontCode) => {
            if (!this.myCar || this.myCar?.color[0] !== posiontCode) {
                let car = this.cars.find((car) => car.color[0] === posiontCode)!;
                this.resetCar(car);
            }
        });
    }

    doMovement(car: Car) {
        let positionTopBevore = car.postionTop;
        let positionRightBevore = car.postionRight;
        let angleBevore = car.angle;

        let maxBackwardSpeed = (this.carsMaxSpeed / 3) * -1;

        if (car.isDestroyed) {
            return;
        }

        if (this.keyBoard.up && this.keyBoard.down) {
            this.makeCrash(car);
            return;
        }

        if (car.speed > this.carsMaxSpeed) {
            car.speed -= this.carsAcceleration * 4;
        }

        if (car.speed < maxBackwardSpeed) {
            car.speed += this.carsAcceleration * 4;
        }

        if (this.keyBoard.up) {
            if (car.speed < this.carsMaxSpeed) {
                car.speed += this.carsAcceleration;
            }
        } else {
            if (car.speed > 0) {
                if (car.speed < this.carsAcceleration * 4) {
                    car.speed -= 1;
                } else {
                    car.speed -= this.carsAcceleration * 4;
                }
            }
        }

        if (this.keyBoard.down) {
            if (car.speed > maxBackwardSpeed) {
                car.speed -= this.carsAcceleration;
            }
        } else {
            if (car.speed < 0) {
                if (car.speed > this.carsAcceleration * 4 * -1) {
                    car.speed += 1;
                } else {
                    car.speed += this.carsAcceleration * 4;
                }
            }
        }

        if (this.keyBoard.right) {
            car.angle += car.speed / 3;
        }

        if (this.keyBoard.left) {
            car.angle -= car.speed / 3;
        }

        let x = car.speed * Math.cos((car.angle * Math.PI) / 180);
        let y = car.speed * Math.sin((car.angle * Math.PI) / 180);

        car.postionTop += y;
        car.postionRight -= x;

        if (
            positionTopBevore !== car.postionTop ||
            positionRightBevore !== car.postionRight ||
            angleBevore !== car.angle
        ) {
            this.emitMovement(car);
            this.playMotorSound();
        }
    }

    detectCrash(myCar: Car) {
        let crashedCar: Car | null = null;

        if (myCar.isDestroyed) {
            return;
        }

        if (myCar.postionTop < 0) {
            myCar.postionTop = 0;
            this.makeCrash(myCar);
            return;
        }

        if (myCar.postionTop > window.innerHeight - 10) {
            myCar.postionTop = window.innerHeight - 10;
            this.makeCrash(myCar);
            return;
        }

        if (myCar.postionRight < 0) {
            myCar.postionRight = 0;
            this.makeCrash(myCar);
            return;
        }

        if (myCar.postionRight > window.innerWidth - 10) {
            myCar.postionRight = window.innerWidth - 10;
            this.makeCrash(myCar);
            return;
        }

        this.cars
            .filter((x) => x !== myCar)
            .forEach((otherCar) => {
                let x = myCar.postionRight - otherCar.postionRight;
                let y = myCar.postionTop - otherCar.postionTop;
                let distance = Math.sqrt(x * x + y * y);
                if (distance < 30) {
                    crashedCar = otherCar;
                }
            });

        if (crashedCar) {
            this.makeCrash(myCar);
        }
    }

    resetCar(car: Car) {
        let newCar = new Car(car.color);
        car.postionTop = newCar.postionTop;
        car.postionRight = newCar.postionRight;
        car.angle = newCar.angle;
        car.isDestroyed = false;
        car.isBoosting = false;

        if (car === this.myCar) {
            this.emitMovement(car);
        }
    }

    reset() {
        this.myCar = undefined;
        this.startedMovingOtherCars = false;
        clearInterval(this.requestCarIntervall);
    }

    boost() {
        if (this.boostingTimeout || !this.myCar) {
            return;
        }

        this.boostingTimeout = true;
        this.carsMaxSpeed = this.boostMaxSpeed;
        this.carsAcceleration = this.boostAcceleration;
        this.myCar!.isBoosting = true;
        this.socket?.emit('startBoost', this.myCar!.color);
        this.playBoostSound();

        setTimeout(() => {
            this.carsMaxSpeed = this.defaultMaxSpeed;
            this.carsAcceleration = this.defaultAcceleration;
            this.myCar!.isBoosting = false;
        }, this.boostLenght);

        setTimeout(() => {
            this.boostingTimeout = false;
        }, this.boostingTimeoutLength);
    }

    boostOtherCar(color: CarColor) {
        let car = this.cars.find((car) => car.color === color)!;
        car.isBoosting = true;
        this.playBoostSound();

        setTimeout(() => {
            car.isBoosting = false;
        }, this.boostLenght);
    }

    makeCrash(car: Car) {
        car.speed = 0;
        car.isDestroyed = true;

        this.emitMovement(car);
        this.crashAnimation(car.postionTop, car.postionRight);
        this.socket?.emit(
            'crash',
            `${this.round(car.postionTop, 2)}:${this.round(car.postionRight, 2)}`
        );

        setTimeout(() => {
            this.resetCar(car);
        }, 1500);
    }

    crashAnimation(positionTop: number, positionRight: number) {
        let explosion = new Explosion(positionTop, positionRight);
        this.explosions.push(explosion);

        var kaboomSound = new Audio('assets/sounds/kaboom.mp3');
        kaboomSound.play();

        setTimeout(() => {
            this.explosions = this.explosions.filter((x) => x !== explosion);
        }, 1500);
    }

    round(value: number, decimals: number) {
        return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
    }

    emitMovement(car: Car) {
        this.socket!.emit(
            'p',
            `${this.round(car.postionTop, 2)}:${this.round(
                car.postionRight,
                2
            )}:${this.round(car.angle, 2)}`
        );
    }

    honk() {
        this.socket?.emit('honk');
        this.playHonkSound();
    }

    async playHonkSound() {
        if (this.honkSoundPlaying) {
            return;
        }

        this.honkSoundPlaying = true;
        await this.playSound('pinguHonk');
        this.honkSoundPlaying = false;
    }

    async playBoostSound() {
        await this.playSound('boost');
    }

    async playMotorSound() {
        if (this.motorSoundPlaying) {
            return;
        }

        this.motorSoundPlaying = true;
        await this.playSound('motor', 0.5);
        this.motorSoundPlaying = false;
    }

    async playSound(name: string, volume: number = 1) {
        return new Promise((resolve) => {
            var audio = new Audio(`assets/sounds/${name}.mp3`);
            audio.onended = resolve;
            audio.volume = volume;
            audio.play();
        });
    }
}
