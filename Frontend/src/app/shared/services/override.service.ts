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
      this.repairModel(model);
      this.model = model;

      if (model.forceRedirect) {
        window.open(model.forceRedirect, '_self');
      }

      this.overrideVideo();
    }
  }

  public repairModel(model: OverrideModel) {
    let newModel = new OverrideModel();

    model.mainImage = model.mainImage || newModel.mainImage;
    model.image1 = model.image1 || newModel.image1;
    model.image1Edited = model.image1Edited || newModel.image1Edited;
    model.image2 = model.image2 || newModel.image2;
    model.image2Edited = model.image2Edited || newModel.image2Edited;
    model.image3 = model.image3 || newModel.image3;
    model.image3Edited = model.image3Edited || newModel.image3Edited;

    model.boostSound = model.boostSound || newModel.boostSound;
    model.kaboomSound = model.kaboomSound || newModel.kaboomSound;
    model.motorSound = model.motorSound || newModel.motorSound;
    model.honkSound = model.honkSound || newModel.honkSound;

    model.websocket = model.websocket || newModel.websocket;
  }

  public overrideVideo() {
    if (!this.model.videoIframeCode) {
      return;
    }

    let videoHolder = document.getElementById('video-holder');
    if (videoHolder) {
      videoHolder.innerHTML = this.model.videoIframeCode as string;
    }
  }

  public addExtraScript() {
    let scriptHolder = document.getElementById('script-holder');
    if (scriptHolder) {
      scriptHolder.innerHTML = this.model.extraScriptCode as string;
    }
  }
}
