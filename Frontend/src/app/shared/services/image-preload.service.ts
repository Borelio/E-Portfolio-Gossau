import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImagePreloadService {
  imageUrls: string[] = [
    'assets/images/picture1.jpg',
    'assets/images/picture1_edited.jpg',
    'assets/images/Flame.png',
  ];

  awaitHomeImage: boolean = false;

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
