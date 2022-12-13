import { Injectable } from '@angular/core';
import { RaceService } from './race.service';

@Injectable({
  providedIn: 'root',
})
export class EasterEggService {
  constructor(private raceService: RaceService) {}
}
