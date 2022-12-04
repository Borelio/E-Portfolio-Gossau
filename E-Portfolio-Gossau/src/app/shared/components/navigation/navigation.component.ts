import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  raceStarted: boolean = false;
  ngOnInit(): void {
    setTimeout(() => {
      this.raceStarted = true;
    }, 1000);
  }
}
