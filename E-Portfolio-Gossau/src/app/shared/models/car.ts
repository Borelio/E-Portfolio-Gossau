export class Car {
  color: string;
  speed: number;
  postionTop: number;
  postionRight: number;
  angle: number;

  constructor(color: string, speed: number, postionTop: number, postionRight: number, angle: number) {
    this.color = color;
    this.speed = speed;
    this.postionTop = postionTop;
    this.postionRight = postionRight;
    this.angle = angle;
  }
}
