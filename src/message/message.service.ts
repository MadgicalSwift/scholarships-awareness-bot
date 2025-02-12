import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomException } from 'src/common/exception/custom.exception';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { UserService } from 'src/model/user.service';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export abstract class MessageService {
  constructor(
    public readonly userService: UserService,
    public readonly mixpanel: MixpanelService,
    public readonly redisService: RedisService
  ) {}
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
  abstract sendButtonsBasedOnResponse(from: string, language: string, responseMessage: string); 
  abstract nextButton(from: string, language: string, selectedState,previousButton);
  abstract getApplyOrSeeMoreLink(from, language, selectedState, previousButton)
  abstract getQuestionPaperLink(from, language, selectedState)
  abstract handleSelectedState(from, selectedState, language);
  abstract feedbackMessage(from, languageMessage);
  abstract uLikeNext(from, languageMessage);
  abstract moreBots(from, languageMessage);
  abstract userfeedback(from, languageMessage);
  abstract thankumessage(from, languageMessage);
  abstract sendST21Message(from, languageMessage);
  abstract fetchAndSendYearButtons(from, language,selectedState );
  abstract fetchAndSendQuestionPaper(from, language,selectedState ,selectedYear);
  abstract sendAfterPdfMessage(from, languageMessage);
  abstract sendQuestionPaperButton(from, languageMessage);
  
  
  abstract sendQuesPapaerNextMaessage(from, languageMessage);
  abstract fetchAndStoreBots(from, languageMessage);
  abstract asyncFetchAndSendBotButtons(from, languageMessage);
  abstract uLikeNextAfterMoreBot(from, languageMessage);
  
  
  
}
