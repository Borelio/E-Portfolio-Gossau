import { Component, OnInit } from '@angular/core';
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

  constructor(
    raceService: RaceService,
    imagePreloadService: ImagePreloadService
  ) {
    this.raceService = raceService;
    this.imagePreloadService = imagePreloadService;
  }

  ngOnInit() {
    setTimeout(() => {
      this.gameErrorDelayOver = true;
    }, this.gameErrorDelay);
  }
}
