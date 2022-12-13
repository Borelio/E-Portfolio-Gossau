import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { RaceService } from './../../services/race.service';

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
  raceService: RaceService;
  userIsSleeping = false;
  sleepingUserTimeOut: NodeJS.Timeout | undefined;
  refreshIntervall: NodeJS.Timer | undefined;

  @Output() socketConnected: EventEmitter<void> = new EventEmitter();
  @Output() socketDisconnected: EventEmitter<void> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.raceService.keyBoard.up = true;
        break;
      case 'ArrowDown':
      case 's':
        this.raceService.keyBoard.down = true;
        break;
      case 'ArrowLeft':
      case 'a':
        this.raceService.keyBoard.left = true;
        break;
      case 'ArrowRight':
      case 'd':
        this.raceService.keyBoard.right = true;
        break;
      case ' ':
        this.raceService.keyBoard.space = true;
        this.raceService.honk();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.raceService.keyBoard.up = false;
        break;
      case 'ArrowDown':
      case 's':
        this.raceService.keyBoard.down = false;
        break;
      case 'ArrowLeft':
      case 'a':
        this.raceService.keyBoard.left = false;
        break;
      case 'ArrowRight':
      case 'd':
        this.raceService.keyBoard.right = false;
        break;
      case ' ':
        this.raceService.keyBoard.space = false;
        break;
    }
  }

  @HostListener('window:visibilitychange')
  visibilitychange() {
    this.sleepingUserTimeOut = undefined;

    if (document.hidden) {
      this.sleepingUserTimeOut = setTimeout(() => {
        this.userIsSleeping = true;
        this.socket?.close();
      }, 10000);
    } else {
      if (this.userIsSleeping) {
        this.userIsSleeping = false;
        this.socket?.connect();
      }
    }
  }

  constructor(raceService: RaceService) {
    this.raceService = raceService;
  }
  //todo fahrsound für Lukas
  ngOnInit() {
    this.socket = io('wss://gossau-be.nussmueller.dev');
    // this.socket = io('ws://localhost:3000');

    this.socket.on('disconnect', () => {
      this.socketDisconnected.emit();
      this.raceService.reset();
    });
    this.socket.on('connect', () => {
      this.socketConnected.emit();

      this.raceService.requestCarIntervall = setInterval(() => {
        console.log('request car');
        this.socket?.emit('requestcar');
      }, 5000);
    });

    this.raceService.init(this.socket);
  }

  ngAfterViewInit() {
    this.refreshIntervall = setInterval(
      async () => this.raceService.refreshView(),
      100
    );
  }

  ngOnDestroy() {
    clearInterval(this.refreshIntervall);
    clearInterval(this.raceService.requestCarIntervall);
  }
}
