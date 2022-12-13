export class Car {
  color: CarColor;
  speed: number;
  postionTop: number;
  postionRight: number;
  angle: number;
  isDestroyed: boolean = false;
  isBoosting: boolean = false;

  constructor(color: CarColor) {
    this.color = color;
    this.speed = 0;

    switch (color) {
      case CarColor.red:
        this.postionTop = 24;
        this.postionRight = 33;
        this.angle = 30;
        break;
      case CarColor.green:
        this.postionTop = 24;
        this.postionRight = 80;
        this.angle = -30;
        break;
      case CarColor.yellow:
        this.postionTop = 65;
        this.postionRight = 101;
        this.angle = -105;
        break;
      case CarColor.blue:
        this.postionTop = 65;
        this.postionRight = 17;
        this.angle = 105;
        break;
      default:
        this.postionTop = 0;
        this.postionRight = 0;
        this.angle = 0;
        break;
    }
  }
}

export enum CarColor {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
}
