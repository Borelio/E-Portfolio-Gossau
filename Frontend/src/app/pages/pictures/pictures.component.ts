import { Component } from '@angular/core';
import { UrlService } from './../../shared/services/url.service';

@Component({
  selector: 'app-pictures',
  templateUrl: './pictures.component.html',
  styleUrls: ['./pictures.component.scss'],
})
export class PicturesComponent {
  urlService: UrlService;

  constructor(urlService: UrlService) {
    this.urlService = urlService;
  }
}
