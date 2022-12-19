import { Component, OnInit } from '@angular/core';
import { ImagePreloadService } from './../../shared/services/image-preload.service';
import { RaceService } from './../../shared/services/race.service';
import { UrlService } from './../../shared/services/url.service';

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
  urlService: UrlService;

  constructor(
    raceService: RaceService,
    imagePreloadService: ImagePreloadService,
    urlService: UrlService
  ) {
    this.raceService = raceService;
    this.imagePreloadService = imagePreloadService;
    this.urlService = urlService;
  }

  ngOnInit() {
    setTimeout(() => {
      this.gameErrorDelayOver = true;
    }, this.gameErrorDelay);
  }
}
