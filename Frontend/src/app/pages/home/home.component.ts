import { Component, OnInit } from '@angular/core';
import { OverrideService } from 'src/app/shared/services/override.service';
import { ImagePreloadService } from './../../shared/services/image-preload.service';
import { RaceService } from './../../shared/services/race.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  raceService: RaceService;
  imagePreloadService: ImagePreloadService;
  gameErrorDelay: number = 2000;
  gameErrorDelayOver: boolean = false;
  overrideService: OverrideService;

  constructor(
    raceService: RaceService,
    imagePreloadService: ImagePreloadService,
    overrideService: OverrideService
  ) {
    this.raceService = raceService;
    this.imagePreloadService = imagePreloadService;
    this.overrideService = overrideService;
  }

  ngOnInit() {
    setTimeout(() => {
      this.gameErrorDelayOver = true;
    }, this.gameErrorDelay);
  }
}
