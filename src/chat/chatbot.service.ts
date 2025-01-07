// import { Injectable } from '@nestjs/common';
// import IntentClassifier from '../intent/intent.classifier';
// import { MessageService } from 'src/message/message.service';
// import { UserService } from 'src/model/user.service';
// import { LocalizationService } from 'src/localization/localization.service';
// // import { localisedStrings } from 'src/i18n/hn/localised-strings';
// import { MixpanelService } from 'src/mixpanel/mixpanel.service';
// import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
// import { count, log } from 'console';
// import { distinct } from 'rxjs';
// import { response } from 'express';

// @Injectable()
// export class ChatbotService {
//   private readonly intentClassifier: IntentClassifier;
//   private readonly message: MessageService;
//   private readonly userService: UserService;
//   private readonly swiftchatService: SwiftchatMessageService;
//   private readonly mixpanel: MixpanelService;

//   constructor(
//     intentClassifier: IntentClassifier,
//     message: MessageService,
//     userService: UserService,
//     swiftchatService: SwiftchatMessageService,
//     mixpanel: MixpanelService,
//   ) {
//     this.intentClassifier = intentClassifier;
//     this.message = message;
//     this.userService = userService;
//     this.swiftchatService = swiftchatService;
//     this.mixpanel = mixpanel;
//   }
  
//   public async processMessage(body: any): Promise<any> {
//     const { from, type , persistent_menu_response} = body;
//     const botID = process.env.BOT_ID;

//     // Retrieve user data
//     let userData = await this.userService.findUserByMobileNumber(from, botID);
    


//     if (!userData) {
//       console.error(`User with mobile number ${from} not found.`);
//       userData = {
//         mobileNumber: from,
//         Botid: botID,
//         language: 'English', 
//         selectedState: 'default_state',
        
//         selectedYear: 0,
//         YearButtonCount:0,
//         seeMoreCount:0,
//         applyLinkCount:0,
//         feedback : null,
//         previousButtonMessage:"",
//         previousButtonMessage1:"",
//       };
//       await this.userService.saveUser(userData);
//       // this.mixpanel.track('Button_Click')
//     }

//     if (!userData.language) {
//       userData.language = 'English';
//       await this.userService.saveUser(userData);
//     }
//     const localisedStrings = LocalizationService.getLocalisedString(userData.language);
//     // for hindi and english language
    
//      if (persistent_menu_response) {
//        const response = persistent_menu_response.body;
//        let userLanguage= userData.language
//       if (response === 'Try Something New') {
//         await this.message.moreBots(from, userLanguage);
//         await this.message.asyncFetchAndSendBotButtons(from, userLanguage);
//         await this.message.uLikeNextAfterMoreBot(from, userLanguage);
//            }
//       else if (response === 'What is NMMS?') {
//             await this.message.sendLanguageChangedMessage(from, userLanguage);
//         await this.message.sendWhoCanApplyButton(from, userLanguage) 
//       }
//       else if (response === 'Change State') {
//              await this.message.sendStateSelectionButton(from, userLanguage);
//       }
//       else if (response === 'Change Language') {
//                 await this.message.sendLanguageSelectionMessage(from, response);
//       }
//       this.mixpanel.track('trackPersistenceButton',{
//         distinctId :from,
//         userYearButtonCount : response,
//         language : userData.language,
//       })
//     } 
//   //  
//     const languageMessage = userData.language;
//     if (type === 'button_response') {
//       const buttonResponse = body.button_response?.body;
//       const languageMessage = userData.language;
      
//       const statesFetch = await localisedStrings.States();
//       if (['english', 'hindi'].includes(buttonResponse?.toLowerCase())) {
//         userData.language = buttonResponse.toLowerCase();
//         await this.userService.saveUser(userData);
//         await this.message.sendLanguageChangedMessage(from, buttonResponse);
//         await this.message.sendWhoCanApplyButton(from, buttonResponse);
//         return;
//       }
//       else if ([localisedStrings.whoCanApply].includes(buttonResponse)) {
       
//         await this.message.sendHowCanSelectedButton(from, languageMessage);
//       } else if (
//         [localisedStrings.howCanSelected].includes(buttonResponse,)) {
         
//         await this.message.sendHowCanSelectedMessage(from, languageMessage);
//       } else if ([localisedStrings.next].includes(buttonResponse)) {
      
//         await this.message.sendStateSelectionButton(from, languageMessage);
//       } else if (statesFetch.includes(buttonResponse)) {
//         userData.selectedState = buttonResponse; // Save the selected state
//         await this.message.StateSelectedinfo(from, languageMessage, buttonResponse);
//         await this.userService.saveUser(userData);
//       } 
      
//       else if ([localisedStrings.seeMore].includes(buttonResponse)) 
//       {  
//         const previousButton = buttonResponse;
//         const selectedState = userData.selectedState;
//         await this.message.nextButton(from, languageMessage, selectedState, previousButton);

       

//         if (userData.seeMoreCount === 1 || userData.seeMoreCount === 5) {
        
          
//           await this.message.feedbackMessage(from, languageMessage);
//         }
//         else if (userData.seeMoreCount === 3) {
         
         
//           await this.message.moreBots(from, languageMessage);
//           await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
//           await this.message.uLikeNextAfterMoreBot(from, languageMessage);
          
//           // 
//         }
//         else if (userData.seeMoreCount === 2 || userData.seeMoreCount === 4 ||userData.seeMoreCount === 0) {
//           await this.message.uLikeNext(from, languageMessage);
//         } 
//         if (userData.seeMoreCount >= 5) 
//           {
//             userData.seeMoreCount = 0; // Reset the count
//           }
//           else{
//             userData.seeMoreCount = (userData.seeMoreCount) + 1;
//           }
//           await this.userService.saveUser(userData); // Save reset count 
//         this.mixpanel.track('trackUserSeeMoreCount',{
//           distinctId :from,
//           userUserSeeMoreCount : buttonResponse,
//           language : userData.language,
//         })
         
//       }
//       else if ([localisedStrings.applyNow].includes(buttonResponse)) 
//         {
            
//           const previousButton = buttonResponse;
//           const selectedState = userData.selectedState;
         
//           await this.message.nextButton(from, languageMessage, selectedState, previousButton);

//           if (userData.applyLinkCount === 1 || userData.applyLinkCount === 5) {
            
          
        
//                  await this.message.feedbackMessage(from, languageMessage);}
//           else if (userData.applyLinkCount === 3) {
          
            
//                 await this.message.moreBots(from, languageMessage);
//                 await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
//                 await this.message.uLikeNextAfterMoreBot(from, languageMessage);
//               }
            
//           else if (userData.applyLinkCount === 2 || userData.applyLinkCount === 4 ||userData.applyLinkCount === 0) {
            
//                 await this.message.uLikeNext(from, languageMessage);} 
          
//                 if (userData.applyLinkCount >= 5) {
//                   userData.applyLinkCount = 0; // Reset the count
//                   } 
//                   else{
//                     userData.applyLinkCount = (userData.applyLinkCount) + 1;
//                   }
//                   await this.userService.saveUser(userData);
//                 this.mixpanel.track('trackUserApplyLinkCount',{
//                   distinctId :from,
//                   userApplyLinkCount : buttonResponse,
//                   language : userData.language,
//                 })
                
//         }
//       else if ([localisedStrings.NMMS1].includes(buttonResponse)) {
//         await this.message.sendLanguageChangedMessage(from, languageMessage);
//         await this.message.sendWhoCanApplyButton(from, buttonResponse) 
//       }
//       else if ([localisedStrings.checkState].includes(buttonResponse)) {
        
//               await this.message.sendStateSelectionButton(from, languageMessage);
//       }
//       else if ([localisedStrings.sure].includes(buttonResponse)) {
//           await this.message.userfeedback(from, languageMessage);
//            const feedbackPromptEnglish =localisedStrings.userfeedback;
//           const feedbackPromptHindi = localisedStrings.userfeedback;
//           userData.previousButtonMessage = feedbackPromptEnglish||feedbackPromptHindi;
//           await this.userService.saveUser(userData);
//       } 


//       else if ([localisedStrings.seeQuestionPaper].includes(buttonResponse)){
//           await this.message.sendST21Message(from, languageMessage);
//           userData.previousButtonMessage1 = buttonResponse;
//           await this.message.fetchAndSendYearButtons(from, languageMessage,userData.selectedState)
//           await this.userService.saveUser(userData);
//         } 

//       else if(userData.previousButtonMessage1==localisedStrings.seeQuestionPaper && buttonResponse)
//         {
//           let selectedYear = buttonResponse;
//           let selectedState = userData.selectedState;
//           await this.message.fetchAndSendQuestionPaper(from, languageMessage,selectedState,selectedYear);
//           userData.previousButtonMessage1='';

//           if (userData.YearButtonCount==1 || userData.YearButtonCount==5){
//             await this.message.sendQuesPapaerNextMaessage(from,languageMessage)
//             await this.message.feedbackMessage(from, languageMessage);
//           }
//           else if (userData.YearButtonCount === 3) {
//             await this.message.sendQuesPapaerNextMaessage(from,languageMessage)
//             await this.message.moreBots(from, languageMessage);
//             await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
//             await this.message.uLikeNextAfterMoreBot(from, languageMessage);
//           }
//           else if (userData.YearButtonCount === 2 || userData.YearButtonCount === 4 || userData.YearButtonCount == 0){ 
//             await this.message.sendQuestionPaperButton(from, languageMessage)
//           }
//           if (userData.YearButtonCount >= 5) {
//             userData.YearButtonCount =0;
//           }
//           else{
//             userData.YearButtonCount = (userData.YearButtonCount) + 1;
//           }
//           await this.userService.saveUser(userData);
//           this.mixpanel.track('userYearButtonCount',{
//             distinctId :from,
//             userYearButtonCount : buttonResponse,
//             language : userData.language,
//           })
          
          
          
//         } 
        
//         this.mixpanel.track('userButtonClick',{
//           distinctId :from,
//           buttonClick : buttonResponse,
//           language : userData.language,
//         })
     
//             }

//  const { text } = body;
//     if (!text || !text.body) {
//       return;
//     }
//     const { intent } = this.intentClassifier.getIntent(text.body);
//     await this.userService.saveUser(userData);
//     if(userData.previousButtonMessage){
//       const feedbackMessage = text.body;
//       userData.feedback = feedbackMessage;
//       await this.userService.saveUser(userData);
//       userData.previousButtonMessage='';
//       await this.userService.saveUser(userData);
//       await this.message.thankumessage(from, userData.language)
//       this.mixpanel.track('user feedback',{
//         distinctId :from,
//         userFeedback : text.body,
//         language : userData.language,
//       })
//     }
//     else if (intent === 'greeting') {
//       const localizedStrings = LocalizationService.getLocalisedString(userData.language);
//       await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
//       await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
//       if (text && text.body) {
//         const feedbackMessage = text.body;
//         userData.feedback = feedbackMessage;
//         await this.userService.saveUser(userData);
//         this.mixpanel.track('welcomeMessage',{
//           distinctId :from,
//           userFeedback : text.body,
//           language : userData.language,
//         })
// }
//     }
    
    

//     return 'ok';
//   }
// }


import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatService: SwiftchatMessageService;
  private readonly mixpanel: MixpanelService;
  public readonly redisService: RedisService

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatService: SwiftchatMessageService,
    mixpanel: MixpanelService,
    redisService: RedisService
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatService = swiftchatService;
    this.mixpanel = mixpanel;
    this.redisService = redisService
  }

  public async processMessage(body: any): Promise<any> {
    const { from, type, persistent_menu_response } = body;
    const botID = process.env.BOT_ID;

    let userData = await this.userService.findUserByMobileNumber(from, botID);

    // Initialize user if not found
    if (!userData) {
      console.error(`User with mobile number ${from} not found.`);
      userData = {
        mobileNumber: from,
        Botid: botID,
        language: 'English',
        selectedState: 'default_state',
        selectedYear: 0,
        YearButtonCount: 0,
        seeMoreCount: 0,
        applyLinkCount: 0,
        feedback: null,
        previousButtonMessage: '',
        previousButtonMessage1: '',
      };
    }

    // Default language setting
    if (!userData.language) {
      userData.language = 'English';
    }

    const localisedStrings = LocalizationService.getLocalisedString(userData.language);

    if (persistent_menu_response) {
      const response = persistent_menu_response.body;
      let userLanguage = userData.language;

      if (response === 'Try Something New') {
        await this.message.moreBots(from, userLanguage);
        await this.message.asyncFetchAndSendBotButtons(from, userLanguage);
        await this.message.uLikeNextAfterMoreBot(from, userLanguage);
      } else if (response === 'What is NMMS?') {
        await this.message.sendLanguageChangedMessage(from, userLanguage);
        await this.message.sendWhoCanApplyButton(from, userLanguage);
      } else if (response === 'Change State') {
        await this.message.sendStateSelectionButton(from, userLanguage);
      } else if (response === 'Change Language') {
        await this.message.sendLanguageSelectionMessage(from, response);
      }

      this.mixpanel.track('trackPersistenceButton', {
        distinctId: from,
        userYearButtonCount: response,
        language: userData.language,
      });
    }

    const languageMessage = userData.language;

    if (type === 'button_response') {
      const buttonResponse = body.button_response?.body;

      const statesFetch = await localisedStrings.States(this.redisService);
      if (['english', 'hindi'].includes(buttonResponse?.toLowerCase())) {
        userData.language = buttonResponse.toLowerCase();
        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.sendWhoCanApplyButton(from, buttonResponse);
        return;
      } else if ([localisedStrings.whoCanApply].includes(buttonResponse)) {
        await this.message.sendHowCanSelectedButton(from, languageMessage);
      } else if ([localisedStrings.howCanSelected].includes(buttonResponse)) {
        await this.message.sendHowCanSelectedMessage(from, languageMessage);
      } else if ([localisedStrings.next].includes(buttonResponse)) {
        await this.message.sendStateSelectionButton(from, languageMessage);
      } else if (statesFetch.includes(buttonResponse)) {
        userData.selectedState = buttonResponse;
        await this.message.StateSelectedinfo(from, languageMessage, buttonResponse);
      } else if ([localisedStrings.seeMore].includes(buttonResponse)) {
        const previousButton = buttonResponse;
        const selectedState = userData.selectedState;
        await this.message.nextButton(from, languageMessage, selectedState, previousButton);

        if (userData.seeMoreCount === 1 || userData.seeMoreCount === 5) {
          await this.message.feedbackMessage(from, languageMessage);
        } else if (userData.seeMoreCount === 3) {
          await this.message.moreBots(from, languageMessage);
          await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
          await this.message.uLikeNextAfterMoreBot(from, languageMessage);
        } else if (userData.seeMoreCount === 2 || userData.seeMoreCount === 4 || userData.seeMoreCount === 0) {
          await this.message.uLikeNext(from, languageMessage);
        }

        userData.seeMoreCount = userData.seeMoreCount >= 5 ? 0 : userData.seeMoreCount + 1;
        this.mixpanel.track('trackUserSeeMoreCount', {
          distinctId: from,
          userUserSeeMoreCount: buttonResponse,
          language: userData.language,
        });
      } else if ([localisedStrings.applyNow].includes(buttonResponse)) {
        const previousButton = buttonResponse;
        const selectedState = userData.selectedState;
        await this.message.nextButton(from, languageMessage, selectedState, previousButton);

        if (userData.applyLinkCount === 1 || userData.applyLinkCount === 5) {
          await this.message.feedbackMessage(from, languageMessage);
        } else if (userData.applyLinkCount === 3) {
          await this.message.moreBots(from, languageMessage);
          await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
          await this.message.uLikeNextAfterMoreBot(from, languageMessage);
        } else if (userData.applyLinkCount === 2 || userData.applyLinkCount === 4 || userData.applyLinkCount === 0) {
          await this.message.uLikeNext(from, languageMessage);
        }

        userData.applyLinkCount = userData.applyLinkCount >= 5 ? 0 : userData.applyLinkCount + 1;
        this.mixpanel.track('trackUserApplyLinkCount', {
          distinctId: from,
          userApplyLinkCount: buttonResponse,
          language: userData.language,
        });
      } else if ([localisedStrings.NMMS1].includes(buttonResponse)) {
        await this.message.sendLanguageChangedMessage(from, languageMessage);
        await this.message.sendWhoCanApplyButton(from, buttonResponse);
      } else if ([localisedStrings.checkState].includes(buttonResponse)) {
        await this.message.sendStateSelectionButton(from, languageMessage);
      } else if ([localisedStrings.sure].includes(buttonResponse)) {
        await this.message.userfeedback(from, languageMessage);
        const feedbackPrompt = localisedStrings.userfeedback;
        userData.previousButtonMessage = feedbackPrompt;
      } else if ([localisedStrings.seeQuestionPaper].includes(buttonResponse)) {
        await this.message.sendST21Message(from, languageMessage);
        userData.previousButtonMessage1 = buttonResponse;
        await this.message.fetchAndSendYearButtons(from, languageMessage, userData.selectedState);
      } else if (userData.previousButtonMessage1 === localisedStrings.seeQuestionPaper && buttonResponse) {
        let selectedYear = buttonResponse;
        let selectedState = userData.selectedState;
        await this.message.fetchAndSendQuestionPaper(from, languageMessage, selectedState, selectedYear);
        userData.previousButtonMessage1 = '';
      }

      // Update counts based on button responses
      userData.YearButtonCount = userData.YearButtonCount >= 5 ? 0 : userData.YearButtonCount + 1;
      this.mixpanel.track('userYearButtonCount', {
        distinctId: from,
        userYearButtonCount: buttonResponse,
        language: userData.language,
      });
    }

    const { text } = body;
    if (!text || !text.body) {
      return;
    }

    const { intent } = this.intentClassifier.getIntent(text.body);
    if (userData.previousButtonMessage) {
      const feedbackMessage = text.body;
      userData.feedback = feedbackMessage;
      await this.message.thankumessage(from, userData.language);
      this.mixpanel.track('user feedback', {
        distinctId: from,
        userFeedback: text.body,
        language: userData.language,
      });
    } else if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language);
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
    }

    // Save user data at the end
    await this.userService.saveUser(userData);

    return 'ok';
  }
}

export default ChatbotService;

