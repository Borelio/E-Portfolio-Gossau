import { transition, trigger } from '@angular/animations';
import { HomeComponent } from './../pages/home/home.component';
import { PicturesComponent } from './../pages/pictures/pictures.component';
import { VideosComponent } from './../pages/videos/videos.component';
import { slideLeft, slideRight } from './animations/route-animations';

export const STATES = ['home', 'pictures', 'video'] as const;

export type ExampleAppState = typeof STATES[number];

interface StateConfiguration {
  path: string;
  component: any;
  order: number;
}

export const stateConfiguration: Record<ExampleAppState, StateConfiguration> = {
  home: {
    path: 'home',
    component: HomeComponent,
    order: 0,
  },
  pictures: {
    path: 'pictures',
    component: PicturesComponent,
    order: 1,
  },
  video: {
    path: 'video',
    component: VideosComponent,
    order: 2,
  },
};

const allStateCombinations: [ExampleAppState, ExampleAppState][] = (() => {
  let result: [ExampleAppState, ExampleAppState][] = [];

  STATES.forEach((state) => {
    STATES.forEach((targetState) => {
      if (state !== targetState) {
        result.push([state, targetState]);
      }
    });
  });

  return result;
})();

export const routerTransition = trigger(
  'routerTransition',
  allStateCombinations.map(([entering, leaving]) =>
    transition(
      `${entering} => ${leaving}`,
      stateConfiguration[entering].order < stateConfiguration[leaving].order
        ? slideLeft
        : slideRight
    )
  )
);

export const routes = [
  ...STATES.map((state) => ({
    path: stateConfiguration[state].path,
    component: stateConfiguration[state].component,
    data: { state },
  })),
  { path: '**', redirectTo: 'home' },
];
