import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { CarColor } from './../../models/car';
import { RaceService } from './../../services/race.service';
import { UrlService } from './../../services/url.service';

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
  readonly carColors = CarColor;
  socket: Socket | undefined;
  raceService: RaceService;
  userIsSleeping = false;
  sleepingUserTimeOut: NodeJS.Timeout | undefined;
  mutationObserver: MutationObserver | undefined;
  componentIsVisible = true;

  @Output() socketConnected: EventEmitter<void> = new EventEmitter();
  @Output() socketDisconnected: EventEmitter<void> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key.toUpperCase()) {
      case 'ARROWUP':
      case 'W':
        this.raceService.keyBoard.up = true;
        break;
      case 'ARROWDOWN':
      case 'S':
        this.raceService.keyBoard.down = true;
        break;
      case 'ARROWLEFT':
      case 'A':
        this.raceService.keyBoard.left = true;
        break;
      case 'ARROWRIGHT':
      case 'D':
        this.raceService.keyBoard.right = true;
        break;
      case ' ':
        this.raceService.keyBoard.space = true;
        this.raceService.honk();
        break;
      case 'SHIFT':
        this.raceService.boost();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    switch (event.key.toUpperCase()) {
      case 'ARROWUP':
      case 'W':
        this.raceService.keyBoard.up = false;
        break;
      case 'ARROWDOWN':
      case 'S':
        this.raceService.keyBoard.down = false;
        break;
      case 'ARROWLEFT':
      case 'A':
        this.raceService.keyBoard.left = false;
        break;
      case 'ARROWRIGHT':
      case 'D':
        this.raceService.keyBoard.right = false;
        break;
      case ' ':
        this.raceService.keyBoard.space = false;
        break;
    }
  }

  @HostListener('window:visibilitychange')
  visibilitychange() {
    clearTimeout(this.sleepingUserTimeOut);

    if (document.hidden) {
      this.sleepingUserTimeOut = setTimeout(() => {
        this.userIsSleeping = true;
        this.socket?.disconnect();
      }, 10000);
    } else {
      if (this.userIsSleeping) {
        this.userIsSleeping = false;
        this.socket?.connect();
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    let componentIsVisible = window.innerWidth > 600;

    if (componentIsVisible !== this.componentIsVisible) {
      this.componentIsVisible = componentIsVisible;

      if (componentIsVisible) {
        this.socket?.connect();
      } else {
        this.socket?.disconnect();
      }
    }
  }

  constructor(
    private elementRef: ElementRef,
    private urlService: UrlService,
    raceService: RaceService
  ) {
    this.raceService = raceService;
  }

  ngOnInit() {
    this.socket = io(this.urlService.urls.websocket);
    // this.socket = io('ws://localhost:3000');

    this.socket.on('disconnect', () => {
      this.socketDisconnected.emit();
      this.raceService.reset();
      console.log('%cWebsocket disconnected', 'color: red');
    });
    this.socket.on('connect', () => {
      this.socketConnected.emit();
      console.log('%cWebsocket connected', 'color: lime');

      this.raceService.requestCarIntervall = setInterval(() => {
        this.socket?.emit('requestcar');
      }, 5000);
    });

    this.raceService.init(this.socket);
    this.onResize();
  }

  ngAfterViewInit() {
    this.raceService.startRefreshIntervall();
  }

  ngOnDestroy() {
    clearInterval(this.raceService.refreshIntervall);
    clearInterval(this.raceService.requestCarIntervall);

    this.mutationObserver?.disconnect();
  }
}
