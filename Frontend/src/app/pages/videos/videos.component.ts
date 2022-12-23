import { AfterViewInit, Component } from '@angular/core';
import { OverrideService } from 'src/app/shared/services/override.service';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
})
export class VideosComponent implements AfterViewInit {
  overrideService: OverrideService;

  constructor(overrideService: OverrideService) {
    this.overrideService = overrideService;
  }

  ngAfterViewInit() {
    this.overrideService.overrideVideo();
  }
}
