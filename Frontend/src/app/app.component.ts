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
  HostListener,
  OnInit,
  RendererFactory2,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { routerTransition } from './shared/routes';
import { EasterEggService } from './shared/services/easter-egg.service';
import { ImagePreloadService } from './shared/services/image-preload.service';
import { SpecialEffectsService } from './shared/services/special-effects.service';

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
export class AppComponent implements OnInit {
  easterEggService: EasterEggService;

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    this.easterEggService.keyPressed(event.key);
  }

  constructor(
    private imagePreloadService: ImagePreloadService,
    private router: Router,
    easterEggService: EasterEggService,
    specialEffectsService: SpecialEffectsService,
    rendererFactory: RendererFactory2,
    elementRef: ElementRef
  ) {
    this.easterEggService = easterEggService;

    let renderer = rendererFactory.createRenderer(null, null);
    let canvas = renderer.createElement('canvas');
    renderer.appendChild(elementRef.nativeElement, canvas);

    specialEffectsService.setCanvas(canvas);
  }

  ngOnInit() {
    let subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.imagePreloadService.loadImages(
          event.urlAfterRedirects === '/home'
        );
        subscription.unsubscribe();
      }
    });
  }
}
