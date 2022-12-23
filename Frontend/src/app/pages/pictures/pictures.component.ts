import { Component } from '@angular/core';
import { OverrideService } from 'src/app/shared/services/override.service';

@Component({
  selector: 'app-pictures',
  templateUrl: './pictures.component.html',
  styleUrls: ['./pictures.component.scss'],
})
export class PicturesComponent {
  overrideService: OverrideService;

  constructor(overrideService: OverrideService) {
    this.overrideService = overrideService;
  }
}
