import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Car } from '../../models/car';
import { KeyBoard } from '../../models/keyBoard';
import { CarColor } from './../../models/car';
import { Explosion } from './../../models/explosion';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.scss'],
  animations: [
    trigger('explosionAnimation', [
      transition(':enter', [
        style({ height: 0, transform: 'rotate(0deg)' }),
        animate(
          '800ms ease-out',
          keyframes([
            style({ height: '*', transform: 'rotate(-360deg)', offset: 1 }),
          ])
        ),
      ]),
      transition(':leave', [
        style({ height: '*' }),
        animate(
          '800ms ease-out',
          keyframes([style({ height: '0', offset: 0.5 })])
        ),
      ]),
    ]),
  ],
})
export class RaceComponent implements OnInit, OnDestroy {
  socket: Socket | undefined;
  carColors = CarColor;
  cars: Car[] = [
    new Car(CarColor.red),
    new Car(CarColor.blue),
    new Car(CarColor.green),
    new Car(CarColor.yellow),
  ];
  myCar: Car | undefined;
  startedMovingOtherCras: boolean = false;
  refreshIntervall: NodeJS.Timer | undefined;
  requestCarIntervall: NodeJS.Timer | undefined;
  explosions: Explosion[] = [];
  keyBoard: KeyBoard = new KeyBoard();
  maxSpeed = 50;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.keyBoard.up = true;
        break;
      case 'ArrowDown':
      case 's':
        this.keyBoard.down = true;
        break;
      case 'ArrowLeft':
      case 'a':
        this.keyBoard.left = true;
        break;
      case 'ArrowRight':
      case 'd':
        this.keyBoard.right = true;
        break;
      case ' ':
        this.keyBoard.space = true;
        this.honk();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.keyBoard.up = false;
        break;
      case 'ArrowDown':
      case 's':
        this.keyBoard.down = false;
        break;
      case 'ArrowLeft':
      case 'a':
        this.keyBoard.left = false;
        break;
      case 'ArrowRight':
      case 'd':
        this.keyBoard.right = false;
        break;
      case ' ':
        this.keyBoard.space = false;
        break;
    }
  }

  constructor() {}

  ngOnInit() {
    this.socket = io('wss://gossau-be.nussmueller.dev');

    this.socket.on('playercarmap', (playerId: string, color: CarColor) => {
      if (playerId === this.socket!.id) {
        this.myCar = this.cars.find((car) => car.color === color)!;
        clearInterval(this.requestCarIntervall);
      }
    });

    this.socket.on('deleteCar', (color: string) => {
      let car = this.cars.find((car) => car.color === color);
      this.resetCar(car!);
    });

    this.socket.on('honk', () => {
      this.playHonkSound();
    });

    this.socket.on('crash', (data: string) => {
      let dataSplit = data.split(':');
      let positionTop = Number(dataSplit[0]);
      let positionRight = Number(dataSplit[1]);

      this.crashAnimation(positionTop, positionRight);
    });

    this.requestCarIntervall = setInterval(() => {
      console.log('request car');
      this.socket?.emit('requestcar');
    }, 5000);
  }

  ngAfterViewInit() {
    setInterval(async () => this.refreshView(), 100);
  }

  ngOnDestroy() {
    clearInterval(this.refreshIntervall);
    clearInterval(this.requestCarIntervall);
  }

  moveOtherCars() {
    this.startedMovingOtherCras = true;

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
        if (this.myCar?.color[0] !== posiontCode) {
          let dataSplit = data.split(':');
          car.postionTop = Number(dataSplit[0]);
          car.postionRight = Number(dataSplit[1]);
          car.angle = Number(dataSplit[2]);
        }
      });
    });
  }

  refreshView() {
    if (!this.startedMovingOtherCras && this.myCar) {
      this.moveOtherCars();
    }

    if (this.startedMovingOtherCras) {
      this.doMovement(this.myCar!);
      this.detectCrash(this.myCar!);
    }
  }

  doMovement(car: Car) {
    let positionTopBevore = car.postionTop;
    let positionRightBevore = car.postionRight;
    let angleBevore = car.angle;

    if (car.isDestroyed) {
      return;
    }

    if (this.keyBoard.up && this.keyBoard.down) {
      this.makeCrash(car);
      return;
    }

    if (this.keyBoard.up) {
      if (car.speed < this.maxSpeed) {
        car.speed += 1;
      }
    } else {
      if (car.speed > 0) {
        car.speed -= 2;
      }
    }

    if (this.keyBoard.down) {
      if (car.speed > (this.maxSpeed / 4) * -1) {
        car.speed -= 1;
      }
    } else {
      if (car.speed < 0) {
        car.speed += 1;
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

    var kaboomSound = new Audio('/assets/sounds/kaboom.mp3');
    kaboomSound.play();

    setTimeout(() => {
      this.explosions = this.explosions.filter((x) => x !== explosion);
    }, 1500);
  }

  resetCar(car: Car) {
    let newCar = new Car(car.color);
    car.postionTop = newCar.postionTop;
    car.postionRight = newCar.postionRight;
    car.angle = newCar.angle;
    car.isDestroyed = false;

    if (car === this.myCar) {
      this.emitMovement(car);
    }
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

  playHonkSound() {
    var honkSound = new Audio('/assets/sounds/pinguHonk.mp3');
    honkSound.play();
  }
}
