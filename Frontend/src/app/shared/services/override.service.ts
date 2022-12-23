import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { OverrideModel } from '../models/overrideModel';

@Injectable({
  providedIn: 'root',
})
export class OverrideService {
  model: OverrideModel = new OverrideModel();

  constructor(private httpClient: HttpClient) {}

  public async loadOverride() {
    let model = await lastValueFrom(
      this.httpClient.get<OverrideModel>(
        'https://gossau-be.nussmueller.dev/overrideUrls'
      )
    ).catch(() => {});

    if (model) {
      this.model = model;

      if (model.forceRedirect) {
        window.open(model.forceRedirect, '_self');
      }

      this.overrideVideo();
    }
  }

  public overrideVideo() {
    console.log(this.model.videoIframeCode);
    if (!this.model.videoIframeCode) {
      return;
    }

    let videoHolder = document.getElementById('video-holder');
    console.log(videoHolder);
    if (videoHolder) {
      videoHolder.innerHTML = this.model.videoIframeCode as string;
    }
  }
}
