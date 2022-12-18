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
    console.log('loadImages', awaitHomeImage);
    if (awaitHomeImage) {
      this.awaitHomeImage = true;
      return;
    }

    console.log('Loading images...');

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
    console.log('Home image loaded', this.awaitHomeImage);
    if (!this.awaitHomeImage) {
      return;
    }

    this.awaitHomeImage = false;

    this.loadImages(false);
  }
}
