import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { OverrideUrls } from '../models/overrideUrls';

@Injectable({
  providedIn: 'root',
})
export class UrlService {
  urls: OverrideUrls = new OverrideUrls();

  constructor(private httpClient: HttpClient) {}

  public async loadOverride() {
    let urls = await lastValueFrom(
      this.httpClient.get<OverrideUrls>(
        'https://gossau-be.nussmueller.dev/overrideUrls'
      )
    ).catch(() => {});

    if (urls) {
      this.urls = urls;
    }
  }
}
