
import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service'; 


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
    console.log(body,"sangeeta");
    
    const { from, type } = body;
    const botID = process.env.BOT_ID;
  
    // Retrieve user data
    let userData = await this.userService.findUserByMobileNumber(from, botID);
  
    // If userData is null, initialize a new user object
    if (!userData) {
      console.error(`User with mobile number ${from} not found.`);
      userData = {
        mobileNumber: from,
        Botid: botID,
        language: 'English', // Default language
      };
      await this.userService.saveUser(userData); // Save the new user
    }
  
    // Ensure language is set
    if (!userData.language) {
      userData.language = 'English';
      await this.userService.saveUser(userData);
    }
  
    // Handle button response
    if (type === 'button_response') {
      const buttonResponse = body.button_response?.body;
      if (['english', 'hindi'].includes(buttonResponse?.toLowerCase())) {
        userData.language = buttonResponse.toLowerCase(); // Save the language
        await this.userService.saveUser(userData);
        console.log(`Language changed to: ${buttonResponse}`);
        await this.message.sendLanguageChangedMessage(from, buttonResponse);
        await this.message.sendWhoCanApplyButton(from, buttonResponse);
        
        return;
      }
      console.log(buttonResponse);
      
       if (buttonResponse == 'Who Can Apply') {
        console.log(buttonResponse,"enter inside of who can apply  fn");
        await this.message.sendWhoCanApplyMessage(from, buttonResponse)
        // addd
        await this.message.sendHowCanSelectedButton(from, buttonResponse)
        return; 
      }
      // added
      
      if (buttonResponse == 'howCanSelected') {
        console.log(buttonResponse,"enter inside of how can selected  fn");
        await this.message.sendHowCanSelectedMessage(from, buttonResponse)
        console.log(buttonResponse);
        return; 
      } 
       
    }
    
    const { text } = body;
    if (!text || !text.body) {
      console.error('Text or body is missing:', body);
      return;
    }
  
    // Determine intent
    const { intent } = this.intentClassifier.getIntent(text.body);
  
    // Save updated user data
    await this.userService.saveUser(userData);
  
    // Handle greeting intent
    if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(
        userData.language,
      );
  
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
       
      return;
    }
  
    return 'ok';
  }
  
}

export default ChatbotService;