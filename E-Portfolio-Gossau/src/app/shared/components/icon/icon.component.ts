import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent {
  location: string = '';

  @Input() set icon(name: string) {
    this.location = '/assets/images/' + name + '.svg';
  }
}
