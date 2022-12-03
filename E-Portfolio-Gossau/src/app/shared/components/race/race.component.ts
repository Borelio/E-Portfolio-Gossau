import { Component, HostListener, OnInit } from '@angular/core';
import { Car } from '../../models/car';
import { KeyBoard } from '../../models/keyBoard';
import { CarColor } from './../../models/car';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.scss'],
})
export class RaceComponent implements OnInit {
  carColors = CarColor;
  cars: Car[] = [
    new Car(CarColor.red, 0, 24, 33, 30),
    new Car(CarColor.green, 0, 24, 80, -30),
    new Car(CarColor.yellow, 0, 65, 101, -105),
    new Car(CarColor.blue, 0, 65, 17, 105),
  ];
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

  ngOnInit() {}

  ngAfterViewInit() {
    setInterval(() => this.refreshView(), 100);
  }

  refreshView() {
    let car = this.cars.find((car) => car.color === CarColor.blue)!;
    this.doMovement(car);
  }

  doMovement(car: Car) {
    if (this.keyBoard.up) {
      if (car.speed < this.maxSpeed) {
        car.speed += 1;
      }
    } else {
      if (car.speed > 0) {
        car.speed -= 1;
      }
    }

    if (this.keyBoard.down) {
      if (car.speed > 0) {
        car.speed -= 1;
      }
    }

    if (this.keyBoard.right) {
      car.angle += 10;
    }

    if (this.keyBoard.left) {
      car.angle -= 10;
    }

    let x = car.speed * Math.cos((car.angle * Math.PI) / 180);
    let y = car.speed * Math.sin((car.angle * Math.PI) / 180);

    car.postionTop += y;
    car.postionRight -= x;
  }
}
