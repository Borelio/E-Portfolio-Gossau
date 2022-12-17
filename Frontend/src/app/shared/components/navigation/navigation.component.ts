import { Component } from '@angular/core';
import { NavigationRoute } from '../../models/routeNavigation';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  raceStarted: boolean = false;
  fullPageNavigationOpen: boolean = false;

  routes = [
    new NavigationRoute('/home', 'Home'),
    new NavigationRoute('/pictures', 'Bilder'),
    new NavigationRoute('/videos', 'Videos'),
  ];
}
