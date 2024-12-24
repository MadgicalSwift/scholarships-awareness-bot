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
  
  // Add this method inside the ChatbotService class

// A method to simulate capturing user input (adjust it to your logic)
async collectUserInput(from: string): Promise<string> {
   return new Promise((resolve) => {
    // Simulating the captured message (replace this with actual logic)
    resolve("User's feedback message here");
  });
}


  public async processMessage(body: any): Promise<any> {
    const { from, type } = body;
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
        feedback : null,
      };
      await this.userService.saveUser(userData);
    }

    if (!userData.language) {
      userData.language = 'English';
      await this.userService.saveUser(userData);
    }

    if (type === 'button_response') {
      const buttonResponse = body.button_response?.body;

      // Handle language selection
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
      } else if (['Apply Now', 'See More', 'See Question Papers', 'अभी अप्लाई करें', 'और देखें'].includes(buttonResponse)) {
        const previousButton = buttonResponse;
        const selectedState = userData.selectedState;
       
          if (!selectedState) {
          console.error('State not selected. Prompting user to select a state.');
          
          return;
        }
        console.log(`Button Clicked: ${previousButton}`);
        console.log(`Selected State: ${selectedState}`);
        await this.message.nextButton(from, languageMessage, selectedState, previousButton)
        userData.buttonClickCount = (userData.buttonClickCount || 0) + 1;
        console.log(`User ${from} has clicked Next Button ${userData.buttonClickCount} times.`,);
      
        // Save updated count to the database
        await this.userService.saveUser(userData);
      
        // Call feedbackMessage on 1st and 5th clicks
        if (userData.buttonClickCount === 1 || userData.buttonClickCount === 5) {
          console.log(`User ${from} hit the Next Button ${userData.buttonClickCount} times. Sending feedback message.`);
          await this.message.feedbackMessage(from, languageMessage);
        }
      
        if (userData.buttonClickCount === 3) {
          console.log(`User ${from} hit the Next Button 3 times. Sending More Bots message.`);
          await this.message.morebots(from, languageMessage);
      }
        // Call ulikenext on 2nd and 4th clicks
        if (userData.buttonClickCount === 2 || userData.buttonClickCount === 4) {
          console.log(`User ${from} hit the Next Button ${userData.buttonClickCount} times. Sending ulikenext message.`);
          await this.message.ulikenext(from, languageMessage);
        }
      
        // Reset count if it reaches 5
        if (userData.buttonClickCount >= 5) {
          console.log(`User ${from} reached 5 clicks. Resetting count.`);
          userData.buttonClickCount = 0; // Reset the count
          await this.userService.saveUser(userData); // Save reset count
        }  
      }else if ([localisedStrings.NMMS1].includes(buttonResponse)) {
        await this.message.sendLanguageChangedMessage(from, languageMessage);
        await this.message.sendWhoCanApplyButton(from, buttonResponse) 
      }
      else if ([localisedStrings.checkstate].includes(buttonResponse)) {
        //await this.message.sendStateSelectionButton(from, languageMessage);
        await this.message.sendStateSelectionButton(from, languageMessage);
      }
      else if ([localisedStrings.sure].includes(buttonResponse)) {
          await this.message.userfeedback(from, languageMessage);
      }
      
        
      
      
    
    }

    const { text } = body;
    if (!text || !text.body) {
      return;
    }

    const { intent } = this.intentClassifier.getIntent(text.body);
    await this.userService.saveUser(userData);
    if (intent === 'greeting') {
      const localizedStrings = LocalizationService.getLocalisedString(userData.language,);
      await this.message.sendWelcomeMessage(from, localizedStrings.welcomeMessage);
      await this.message.sendLanguageSelectionMessage(from, localizedStrings.languageSelection);
      if (userData.feedback === "Kindly express your thoughts...") {
          await this.message.thankumessage(from, languageMessage)
      }
    
      return;
    }

    if (userData.feedback === "Kindly express your thoughts..." && intent === 'text') {
      const feedbackMessage = text.body;
      
      // Save the feedback in the user data
      userData.feedback = feedbackMessage;
      await this.userService.saveUser(userData);
    }
    
    return 'ok';
  }
}

export default ChatbotService;
