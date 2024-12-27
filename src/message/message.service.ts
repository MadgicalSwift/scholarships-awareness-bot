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
  abstract sendHowCanSelectedButton(from: string, language: string);
  abstract sendHowCanSelectedMessage(from: string, language: string);
  abstract sendStateSelectionButton(from: string, language: string);
  abstract StateSelectedinfo(from: string, language: string, selectedState: string);
  abstract  sendButtonsBasedOnResponse(from: string, language: string, responseMessage: string); 
  abstract nextButton(from: string, language: string, selectedState,previousButton);
  abstract getLinkForButton(from, language, selectedState, previousButton);
  abstract handleSelectedState(from, selectedState, language);
  abstract feedbackMessage(from, languageMessage);
  abstract ulikenext(from, languageMessage);
  abstract morebots(from, languageMessage);
  abstract userfeedback(from, languageMessage);
  abstract thankumessage(from, languageMessage);
  abstract sangeeta(from, languageMessage);
}
