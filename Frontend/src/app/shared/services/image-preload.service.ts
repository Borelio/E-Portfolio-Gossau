import { Injectable } from '@angular/core';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class ImagePreloadService {
  imageUrls: string[] = [];

  awaitHomeImage: boolean = false;

  constructor(private urlService: UrlService) {
    this.imageUrls.push(this.urlService.urls.image1);
    this.imageUrls.push(this.urlService.urls.image1Edited);
    this.imageUrls.push(this.urlService.urls.image2);
    this.imageUrls.push(this.urlService.urls.image2Edited);
    this.imageUrls.push(this.urlService.urls.image3);
    this.imageUrls.push(this.urlService.urls.image3Edited);
  }

  async loadImages(awaitHomeImage: boolean) {
    if (awaitHomeImage) {
      this.awaitHomeImage = true;
      return;
    }

    let promises = this.imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    });
    return Promise.all(promises);
  }

  homeImageLoaded() {
    if (!this.awaitHomeImage) {
      return;
    }

    this.awaitHomeImage = false;

    this.loadImages(false);
  }
}
