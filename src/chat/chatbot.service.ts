import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
// import { localisedStrings } from 'src/i18n/hn/localised-strings';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { RedisService } from 'src/cache/cache.service';
import { count, log } from 'console';
import { distinct } from 'rxjs';
import { response } from 'express';

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
    redisService: RedisService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatService = swiftchatService;
    this.mixpanel = mixpanel;
    this.redisService = redisService;
  }
  
  public async processMessage(body: any): Promise<any> {
    const { from, type , persistent_menu_response} = body;
    const botID = process.env.BOT_ID;

    // Retrieve user data
    let userData = await this.userService.findUserByMobileNumber(from, botID);
    


    if (!userData) {
      console.error(`User with mobile number ${from} not found.`);

await this.userService.createUser(
  from, // mobileNumber
  0, // yearButtonCount
  0, // pdfIndex
  'English', // language
  botID, // botID
  'default_state', // selectedState
  0, // selectedYear
  0, // seeMoreCount
  0, // applyLinkCount
  [], // feedback
  "", // previousButtonMessage
  "" // previousButtonMessage1
);
      // this.mixpanel.track('Button_Click')
    }

    if (!userData.language) {
      userData.language = 'English';
      await this.userService.saveUser(userData);
    }
    const localisedStrings = LocalizationService.getLocalisedString(userData.language);
    // for hindi and english language
    // console.log("userData",userData);
    
     if (persistent_menu_response) {
       const response = persistent_menu_response.body;
       let userLanguage= userData.language
<<<<<<< HEAD
      if (response === 'See More') {
=======
      if (response === 'Try New Things') {
>>>>>>> newCaching
        await this.message.moreBots(from, userLanguage);
        await this.message.asyncFetchAndSendBotButtons(from, userLanguage);
        await this.message.uLikeNextAfterMoreBot(from, userLanguage);
           }
      else if (response === 'What is NMMS?') {
            // await this.message.sendLanguageChangedMessage(from, userLanguage);
        await this.message.sendWhoCanApplyButton(from, userLanguage) 
      }
      else if (response === 'Change State') {
             await this.message.sendStateSelectionButton(from, userLanguage);
      }
      else if (response === 'Change Language') {
                await this.message.sendLanguageSelectionMessage(from, userLanguage);
      }
      
      this.mixpanel.track('trackPersistenceButton',{
        distinctId :from,
        userYearButtonCount : response,
        language : userData.language,
      })
    } 
  //  
    const languageMessage = userData.language;
    if (type === 'button_response') {
      const buttonResponse = body.button_response?.body;
      const languageMessage = userData.language;
      

      
      const statesFetch =  [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
        'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
        'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir',
        'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
        'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
        'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
        'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ]




      if (['english', 'hindi'].includes(buttonResponse?.toLowerCase())) {

        await this.message.sendWhoCanApplyButton(from, buttonResponse?.toLowerCase());
        
        userData.language = buttonResponse?.toLowerCase()
        await this.userService.saveUser(userData);
      }
      else if ([localisedStrings.whoCanApply].includes(buttonResponse)) {
       
        await this.message.sendHowCanSelectedButton(from, languageMessage);
      } else if (
        [localisedStrings.howCanSelected].includes(buttonResponse,)) {
         
        await this.message.sendHowCanSelectedMessage(from, languageMessage);
      } else if ([localisedStrings.next].includes(buttonResponse)) {
      
        await this.message.sendStateSelectionButton(from, languageMessage);
      } else if (statesFetch.includes(buttonResponse)) {
        userData.selectedState = buttonResponse; // Save the selected state
        await this.message.StateSelectedinfo(from, languageMessage, buttonResponse);
        await this.userService.saveUser(userData);
      } 
      else if([localisedStrings.applySchloarship].includes(buttonResponse)){
        await this.message.StateSelectedinfo(from, languageMessage, userData.selectedState);
      }
      
      else if ([localisedStrings.viewWebsite].includes(buttonResponse)) 
      {  
        const previousButton = buttonResponse;
        const selectedState = userData.selectedState;
        await this.message.nextButton(from, languageMessage, selectedState, previousButton);

       

        if (userData.seeMoreCount === 1 || userData.seeMoreCount === 5) {
        
          
          await this.message.feedbackMessage(from, languageMessage);
        }
        else if (userData.seeMoreCount === 3) {
         
         
          await this.message.moreBots(from, languageMessage);
          await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
          await this.message.uLikeNextAfterMoreBot(from, languageMessage);
          
          // 
        }
        else if (userData.seeMoreCount === 2 || userData.seeMoreCount === 4 ||userData.seeMoreCount === 0) {
          await this.message.uLikeNext(from, languageMessage);
        } 
        if (userData.seeMoreCount >= 5) 
          {
            userData.seeMoreCount = 0; // Reset the count
          }
          else{
            userData.seeMoreCount = (userData.seeMoreCount) + 1;
          }
          await this.userService.saveUser(userData); // Save reset count 
        this.mixpanel.track('trackUserSeeMoreCount',{
          distinctId :from,
          userUserSeeMoreCount : buttonResponse,
          language : userData.language,
        })
         
      }
      else if ([localisedStrings.applyNow].includes(buttonResponse)) 
        {
            
          const previousButton = buttonResponse;
          const selectedState = userData.selectedState;
         
          await this.message.nextButton(from, languageMessage, selectedState, previousButton);

          if (userData.applyLinkCount === 1 || userData.applyLinkCount === 5) {
            
          
        
                 await this.message.feedbackMessage(from, languageMessage);}
          else if (userData.applyLinkCount === 3) {
          
                await this.message.moreBots(from, languageMessage);
                await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
                await this.message.uLikeNextAfterMoreBot(from, languageMessage);
              }
            
          else if (userData.applyLinkCount === 2 || userData.applyLinkCount === 4 ||userData.applyLinkCount === 0) {
              
                await this.message.uLikeNext(from, languageMessage);
                } 
          
                if (userData.applyLinkCount >= 5) {
                  userData.applyLinkCount = 0; // Reset the count
                  } 
                  else{
                    userData.applyLinkCount = (userData.applyLinkCount) + 1;
                  }
                  await this.userService.saveUser(userData);
                this.mixpanel.track('trackUserApplyLinkCount',{
                  distinctId :from,
                  userApplyLinkCount : buttonResponse,
                  language : userData.language,
                })
                
        }
      else if ([localisedStrings.NMMS1].includes(buttonResponse)) {
        // await this.message.sendLanguageChangedMessage(from, languageMessage);
        await this.message.sendWhoCanApplyButton(from, userData.language) 
      }
<<<<<<< HEAD
      else if ([localisedStrings.checkState, localisedStrings.changeState].includes(buttonResponse)) {
=======
      else if ([localisedStrings.checkState,localisedStrings.changeState, localisedStrings.chooseAnotherState].includes(buttonResponse)) {
>>>>>>> newCaching
        
              await this.message.sendStateSelectionButton(from, languageMessage);
      }
      else if ([localisedStrings.sure].includes(buttonResponse)) {
          await this.message.userfeedback(from, languageMessage);
           const feedbackPromptEnglish =localisedStrings.userfeedback;
          const feedbackPromptHindi = localisedStrings.userfeedback;
          userData.previousButtonMessage = feedbackPromptEnglish||feedbackPromptHindi;
          await this.userService.saveUser(userData);
      } 


      else if ([localisedStrings.seeQuestionPaper].includes(buttonResponse)){
          // await this.message.sendST21Message(from, languageMessage);
          userData.previousButtonMessage1 = buttonResponse;
          await this.message.fetchAndSendYearButtons(from, languageMessage,userData.selectedState)
          await this.userService.saveUser(userData);
        } 

      else if(userData.previousButtonMessage1==localisedStrings.seeQuestionPaper && buttonResponse)
        {
          let selectedYear = buttonResponse;
          let selectedState = userData.selectedState;
          await this.message.fetchAndSendQuestionPaper(from, languageMessage,selectedState,selectedYear);
          userData.previousButtonMessage1='';

          if (userData.yearButtonCount==1 || userData.yearButtonCount==5){
            await this.message.sendQuesPapaerNextMaessage(from,languageMessage)
            await this.message.feedbackMessage(from, languageMessage);
          }
          else if (userData.yearButtonCount === 3) {
            await this.message.sendQuesPapaerNextMaessage(from,languageMessage)
            await this.message.moreBots(from, languageMessage);
            await this.message.asyncFetchAndSendBotButtons(from, languageMessage);
            await this.message.uLikeNextAfterMoreBot(from, languageMessage);
          }
          else if (userData.yearButtonCount === 2 || userData.yearButtonCount === 4 || userData.yearButtonCount == 0){ 
            await this.message.sendQuestionPaperButton(from, languageMessage)
          }
          if (userData.yearButtonCount >= 5) {
            userData.yearButtonCount =0;
          }
          else{
            userData.yearButtonCount = (userData.yearButtonCount) + 1;
          }
          await this.userService.saveUser(userData);
          this.mixpanel.track('userYearButtonCount',{
            distinctId :from,
            userYearButtonCount : buttonResponse,
            language : userData.language,
          })
          
          
          
        } 
        
        this.mixpanel.track('userButtonClick',{
          distinctId :from,
          buttonClick : buttonResponse,
          language : userData.language,
        })
     
            }

 const { text } = body;
    if (!text || !text.body) {
      return;
    }
    const { intent } = this.intentClassifier.getIntent(text.body);
    

    if(userData.previousButtonMessage){
      const feedbackMessage = text.body;
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString(); 
      // const formattedDate = currentDate.toLocaleDateString(); 
      if (!Array.isArray(userData.feedback)) {
        userData.feedback = [];
    }

    // Push new feedback with date
        userData.feedback.push({
          date: formattedDate,  
          feedback: feedbackMessage
      });
    // Filter out feedback older than 2 months

          userData.feedback = userData.feedback.filter(entry => {
            const feedbackDate = new Date(entry.date);
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
            return feedbackDate >= twoMonthsAgo;
        }
      );

       


      // userData.feedback = feedbackMessage;
      await this.userService.saveUser(userData);
      // console.log('user main feedback', userData.feedback)
      userData.previousButtonMessage='';
      await this.userService.saveUser(userData);
      await this.message.thankumessage(from, userData.language)
      this.mixpanel.track('user feedback',{
        distinctId :from,
        userFeedback : text.body,
        language : userData.language,
      })
    }
<<<<<<< HEAD
//  send welcome message
    else if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language);
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
=======


    else if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language);
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
     
>>>>>>> newCaching
      if (text && text.body) {
        // const feedbackMessage = text.body;
        // userData.feedback = feedbackMessage;
        // await this.userService.saveUser(userData);
        this.mixpanel.track('welcomeMessage',{
          distinctId :from,
          userFeedback : text.body,
          language : userData.language,
        })
}
    }

    return 'ok';
  }
}

export default ChatbotService;
