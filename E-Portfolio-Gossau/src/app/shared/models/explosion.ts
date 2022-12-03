import { Car } from './car';

export class Explosion {
  postionTop: number;
  postionRight: number;
  car: Car;

  constructor(postionTop: number, postionRight: number, car: Car) {
    this.postionTop = postionTop;
    this.postionRight = postionRight;
    this.car = car;
  }
}
