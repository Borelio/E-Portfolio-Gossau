import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component } from '@angular/core';
import { routerTransition } from './shared/routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    routerTransition,
    trigger('easterEggHelpAnimation', [
      transition('true <=> false', [
        style({
          display: 'flex',
        }),
        animate(
          '2000ms ease-in',
          keyframes([
            style({ transform: 'scale(0) rotate(-30deg)', offset: 0 }),
            style({ transform: 'scale(1) rotate(90deg)', offset: 0.5 }),
            style({ transform: 'scale(0) rotate(180deg)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'E-Portfolio-Gossau';
}
