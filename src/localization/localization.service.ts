import { Injectable } from '@nestjs/common';
import { localisedStrings as english } from 'src/i18n/en/localised-strings';
import { localisedStrings as hindi } from 'src/i18n/hn/localised-strings';

@Injectable()
export class LocalizationService {
  static getLocalisedString(language: string): any {
    console.log('Requested language:', language);
    if (language === 'हिन्दी' || language === 'hindi') {
      return hindi;
    } else {
      return english; // Default to English if language is invalid
    }
  }
}