import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomException } from 'src/common/exception/custom.exception';
import { localisedStrings } from 'src/i18n/en/localised-strings';

@Injectable()
export abstract class MessageService {
  async prepareWelcomeMessage() {
    return localisedStrings.welcomeMessage;
  }
  getSeeMoreButtonLabel() {
    return localisedStrings.seeMoreMessage;
  }

  async sendMessage(baseUrl: string, requestData: any, token: string) {
    try {
      const response = await axios.post(baseUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      //throw new CustomException(error);
      console.log('Error sending message:', error.response?.data);
    }
  }

  abstract sendWelcomeMessage(from: string, language: string);
  abstract sendLanguageSelectionMessage(from: string, language: string);
  abstract sendLanguageChangedMessage(from: string, language: string);
  abstract sendWhoCanApplyButton(from: string, language: string);
  //abstract sendWhoCanApplyMessage(from: string, language: string)

  // added
  abstract sendHowCanSelectedButton(from: string, language: string);
  abstract sendHowCanSelectedMessage(from: string, language: string);
  abstract sendStateSelectionButton(from: string, language: string);
  abstract StateSelectedinfo(from: string, language: string);
  

}
