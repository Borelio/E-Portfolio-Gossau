import { Component, OnInit } from '@angular/core';
import { RaceService } from './../../shared/services/race.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  raceService: RaceService;
  gameErrorDelay: number = 2000;
  gameErrorDelayOver: boolean = false;

  constructor(raceService: RaceService) {
    this.raceService = raceService;
  }

  ngOnInit() {
    setTimeout(() => {
      this.gameErrorDelayOver = true;
    }, this.gameErrorDelay);
  }
}
