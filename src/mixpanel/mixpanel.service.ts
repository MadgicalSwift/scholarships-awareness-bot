import * as Mixpanel from 'mixpanel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MixpanelService {
  private mixpanel: any;

  constructor() {
    this.mixpanel = Mixpanel.init('8d5345d3da6f2d016ef668708683115d', {
      protocol: 'http',
    });
  }

  public track(eventName: string, action: any = {}): void {
    this.mixpanel.track(eventName, action);
  }
}