import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Car } from '../../models/car';
import { KeyBoard } from '../../models/keyBoard';

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.scss']
})
export class RaceComponent implements OnInit {
  @ViewChild('racefield') canvas!: ElementRef;
  canvasContext!: CanvasRenderingContext2D;
  cars: Car[] = [new Car('red', 12, 100, 100, 90)];
  keyBoard: KeyBoard = new KeyBoard();

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

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.canvasContext = this.canvas.nativeElement.getContext("2d");
    setInterval(() => this.refreshView(), 10);
  }

  refreshView() {
    let base_image = new Image();
    let context = this.canvasContext;
    var img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0);
    }
    img.src = "http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg";
  }
}
