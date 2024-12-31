import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { count, log } from 'console';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatService: SwiftchatMessageService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatService: SwiftchatMessageService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatService = swiftchatService;
  }
  
  public async processMessage(body: any): Promise<any> {
    const { from, type , persistent_menu_response} = body;
    const botID = process.env.BOT_ID;

    // Retrieve user data
    let userData = await this.userService.findUserByMobileNumber(from, botID);

    if (!userData) {
      console.error(`User with mobile number ${from} not found.`);
      userData = {
        mobileNumber: from,
        Botid: botID,
        language: 'English', // Default language
        selectedState: 'default_state',
        buttonClickCount: 0,
        selectedYear: 0,
        YearButtonCount:0,
        seeMoreCount:0,
        applyLinkCount:0,
        feedback : null,
        previousButtonMessage:"",
        previousButtonMessage1:"",
      };
      await this.userService.saveUser(userData);
    }

    if (!userData.language) {
      userData.language = 'English';
      await this.userService.saveUser(userData);
    }

    
    console.log('UserData',userData);
    
     if (persistent_menu_response) {
       const response = persistent_menu_response.body;
      if (response === 'Try Something New') {
            await this.message.feedbackMessage(from, response);
           }
      else if (response === 'What is NMMS?') {
            await this.message.sendLanguageChangedMessage(from, response);
        await this.message.sendWhoCanApplyButton(from, response) 
      }
      else if (response === 'Change State') {
             await this.message.sendStateSelectionButton(from, response);
      }
      else if (response === 'Change Language') {
                await this.message.sendLanguageSelectionMessage(from, response);
      }
    } 
   
    const languageMessage = userData.language;
    if (type === 'button_response') {
      const buttonResponse = body.button_response?.body;
      if (['english', 'hindi'].includes(buttonResponse?.toLowerCase())) {
        userData.language = buttonResponse.toLowerCase();
        await this.userService.saveUser(userData);
        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.sendWhoCanApplyButton(from, buttonResponse);
        return;
      }

      const languageMessage = userData.language;
      
      const statesFetch = await localisedStrings.States();
      
      if (['🎯Who Can Apply', '🎯कौन आवेदन कर सकता है'].includes(buttonResponse)) {
        await this.message.sendHowCanSelectedButton(from, languageMessage);
      } else if (
        ['📝 How can I get selected?', '📝 मेरा चयन कैसे हो सकता है?'].includes(
          buttonResponse,
        )
      ) {
        await this.message.sendHowCanSelectedMessage(from, languageMessage);
      } else if (['Next', 'अगला'].includes(buttonResponse)) {
        await this.message.sendStateSelectionButton(from, languageMessage);
      } else if (statesFetch.includes(buttonResponse)) {
        userData.selectedState = buttonResponse; // Save the selected state
        await this.userService.saveUser(userData);
        await this.message.StateSelectedinfo(from, languageMessage, buttonResponse);
      } 
      
      else if (['See More', 'और देखें'].includes(buttonResponse)) 
      {
          console.log('See More count:', userData.seeMoreCount);
        const previousButton = buttonResponse;
        const selectedState = userData.selectedState;
       
          if (!selectedState) {
             return;
        }
        await this.message.nextButton(from, languageMessage, selectedState, previousButton);
        if (userData.seeMoreCount === 1 || userData.seeMoreCount === 5) {
         
    
               await this.message.feedbackMessage(from, languageMessage);}
        else if (userData.seeMoreCount === 3) {
         
         
              await this.message.morebots(from, languageMessage);}
          
        else if (userData.seeMoreCount === 2 || userData.seeMoreCount === 4 ||userData.seeMoreCount === 0) {
          
       
              await this.message.ulikenext(from, languageMessage);} 
           if (userData.seeMoreCount > 5) 
            {
               userData.seeMoreCount = 0; // Reset the count
              
              } 
              else{
                userData.seeMoreCount = (userData.seeMoreCount) + 1;
              }
          await this.userService.saveUser(userData); // Save reset count 
      }
      else if (['Apply Now', 'अभी अप्लाई करें'].includes(buttonResponse)) 
        {
            console.log('Apply Now count:', userData.applyLinkCount);
          const previousButton = buttonResponse;
          const selectedState = userData.selectedState;
         
            if (!selectedState) {
               return;
          }
          
          
              await this.message.nextButton(from, languageMessage, selectedState, previousButton);
          if (userData.applyLinkCount === 1 || userData.applyLinkCount === 5) {
            
        
                 await this.message.feedbackMessage(from, languageMessage);}
          else if (userData.applyLinkCount === 3) {
            
            
                await this.message.morebots(from, languageMessage);}
            
          else if (userData.applyLinkCount === 2 || userData.applyLinkCount === 4 ||userData.applyLinkCount === 0) {
           
    
                await this.message.ulikenext(from, languageMessage);} 
                if (userData.applyLinkCount > 5) 
                  {
                     userData.applyLinkCount = 0; // Reset the count
                   
                    } 
                    else{
                      userData.applyLinkCount = (userData.applyLinkCount) + 1;
                    }
                await this.userService.saveUser(userData); // Save reset count 
         
        }
      else if ([localisedStrings.NMMS1].includes(buttonResponse)) {
        await this.message.sendLanguageChangedMessage(from, languageMessage);
        await this.message.sendWhoCanApplyButton(from, buttonResponse) 
      }
      else if ([localisedStrings.checkstate].includes(buttonResponse)) {
              await this.message.sendStateSelectionButton(from, languageMessage);
      }
      else if ([localisedStrings.sure].includes(buttonResponse)) {
          await this.message.userfeedback(from, languageMessage);
           const feedbackPromptEnglish =localisedStrings.userfeedback;
          const feedbackPromptHindi = localisedStrings.userfeedback;
          userData.previousButtonMessage = feedbackPromptEnglish||feedbackPromptHindi;
          await this.userService.saveUser(userData);
      } 


      else if (['See Question Papers', 'प्रश्न पत्र देखें'].includes(buttonResponse)){
          await this.message.sendST21Message(from, languageMessage);
          const feedbackPromptEnglish =localisedStrings.ST21Message;
          const feedbackPromptHindi = localisedStrings.ST21Message;
          userData.previousButtonMessage1 = feedbackPromptEnglish||feedbackPromptHindi;
          await this.userService.saveUser(userData);
          let selectedState = userData.selectedState
          await this.message.fetchAndSendYearButtons(from, languageMessage,selectedState)
        } 

      else if(userData.previousButtonMessage1 && buttonResponse){
          let selectedYear = buttonResponse;
          let selectedState = userData.selectedState;
          await this.message.fetchAndSendQuestionPaper(from, languageMessage,selectedState,selectedYear);
          userData.previousButtonMessage1='';
          
          if (userData.YearButtonCount==1 || userData.YearButtonCount==5){
            
            await this.message.sendQuesPapaerNextMaessage(from,languageMessage)
            await this.message.feedbackMessage(from, languageMessage);
          }
          else if (userData.YearButtonCount === 3) {
           
            await this.message.sendQuesPapaerNextMaessage(from,languageMessage)
                    await this.message.morebots(from, languageMessage);}
          else if (userData.YearButtonCount === 2 || userData.YearButtonCount === 4 || userData.YearButtonCount == 0){
           
            await this.message.sendQuestionPaperButton(from, languageMessage)
          }
          if (userData.YearButtonCount > 5) {
            userData.YearButtonCount =0;
          }
          else{
            userData.YearButtonCount = userData.YearButtonCount+1 ;
          }
          
          await this.userService.saveUser(userData);
          console.log('YearButtonCount',userData.YearButtonCount);
          
        }       
            }



  
   
 const { text } = body;
    if (!text || !text.body) {
      return;
    }
    const { intent } = this.intentClassifier.getIntent(text.body);
    await this.userService.saveUser(userData);
    if(userData.previousButtonMessage){
      const feedbackMessage = text.body;
      userData.feedback = feedbackMessage;
      await this.userService.saveUser(userData);
      userData.previousButtonMessage='';
      await this.userService.saveUser(userData);
      await this.message.thankumessage(from, userData.language)
    }
    else if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language);
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
      if (text && text.body) {
        const feedbackMessage = text.body;
        userData.feedback = feedbackMessage;
        await this.userService.saveUser(userData);
}
    }
    
    

    return 'ok';
  }
}

export default ChatbotService;
