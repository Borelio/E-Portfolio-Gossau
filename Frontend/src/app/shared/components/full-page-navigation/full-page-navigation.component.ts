import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavigationRoute } from '../../models/routeNavigation';

@Component({
  selector: 'app-full-page-navigation',
  templateUrl: './full-page-navigation.component.html',
  styleUrls: ['./full-page-navigation.component.scss'],
})
export class FullPageNavigationComponent {
  @Input() routes: NavigationRoute[] = [];
  @Input() show: boolean = false;
  @Output() showChange = new EventEmitter<boolean>();
  @HostBinding('class.show') get showThisComponent() {
    return this.show;
  }

  constructor(private router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
    this.showChange.emit(false);
  }
}
