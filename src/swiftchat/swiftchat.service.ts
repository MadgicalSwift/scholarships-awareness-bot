import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import axios from 'axios';
dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: 'text',
      text: {
        body: requestBody,
      },
    };
  }
  
  async sendWelcomeMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.welcomeMessage,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendLanguageChangedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.languageChangedMessage,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendWhoCanApplyButton(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.whoCanApplyPrompt;
    
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: message,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: localisedStrings.whoCanApply,
            reply:localisedStrings.whoCanApply,
          },
        ],
        allow_custom_response: false,
      },
    };
    
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
  
    async sendHowCanSelectedButton(from: string, language: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.getWhoCanApplyStrings;
      
      const messageData = {
        to: from,
        type: 'button',
        button: {
          body: {
            type: 'text',
            text: {
              body: message,
            },
          },
          buttons: [
            {
              type: 'solid',
              body: localisedStrings.howCanSelected,
              reply:localisedStrings.howCanSelected,
            },
          ],
          allow_custom_response: false,
        },
      };
      
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    }

  async sendHowCanSelectedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.selectedMessage;

    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: message,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: localisedStrings.next,
            reply: localisedStrings.next,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
  
  
  async sendStateSelectionButton(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = "For which state do you want to see the information available?";

    let states = [];
    try {
        const response = await axios.get('https://script.google.com/macros/s/AKfycbwOHTUl17ZPwIw-m90UHDNyrovPifw6fQrSjUkmSprkka4UtEpJhFIUIkRqsJkjsPzNxA/exec', {
            params: { action: 'getStates' }
        });
        console.log(response.data); // Log the fetched data
        if (response.data) {
            states = response.data; // Assign the states array from the API response
        } 
    } catch (error) {
        console.error('Error fetching states:', error);
        states = ['Unable to fetch states at the moment. Please try again later.']; // Fallback on error
    }
   
    const buttons = states.map((state) => ({
        type: 'solid',  // Button type
        body: state,    // Button text (state name)
        reply: state,   // The reply value for the button (state name)
    }));
    const messageData = {
        to: from,
        type: 'button',
        button: {
            body: {
                type: 'text',
                text: {
                    body: message,  // Message to ask the user to select a state
                },
            },
            buttons: buttons,  // Dynamically created buttons for each state
            allow_custom_response: false,
        },
    };
    // Send the message with the generated buttons
    try {
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    } catch (error) {
        console.error('Error sending message:', error); // Handle any errors during message sending
    }
}

async StateSelectedinfo(from: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const defaultMessage = "For which state do you want to see the information available?";
  
  let stateDetails = null;
  try {
    const response = await axios.get(
      "https://script.google.com/macros/s/AKfycbwOHTUl17ZPwIw-m90UHDNyrovPifw6fQrSjUkmSprkka4UtEpJhFIUIkRqsJkjsPzNxA/exec?action=getStateDetails&state=Uttarakhand",
      {
        params: { action: "getStateDetails", state: "Uttarakhand" },
      }
    );
    console.log(response.data); // Log the fetched data
    if (response.data) {
      stateDetails = response.data; // Assign state details from the API response
    }
  } catch (error) {
    console.error("Error fetching state details:", error);
    stateDetails = { error: "Unable to fetch state details at the moment. Please try again later." }; // Fallback on error
  }

  // Prepare the message content
  let messageContent = defaultMessage;
  if (stateDetails && !stateDetails.error) {
    messageContent += `\n\nState Name: ${stateDetails["State Name"]}`;
    messageContent += `\nMinimum Percentage (Class 7): ${stateDetails["Minimum Percentage (Class 7)"]}`;
    messageContent += `\nFamily Income Limit: ${stateDetails["Family Income Limit"]}`;
    messageContent += `\nApplicable Schools: ${stateDetails["Applicable Schools"]}`;
    messageContent += `\nApplication Mode: ${stateDetails["Application Mode"]}`;
    messageContent += `\nPortal/Website Link: ${stateDetails["Portal/Website Link"]}`;
    messageContent += `\nHelpdesk Contact Number: ${stateDetails["Helpdesk Contact Number"]}`;
    messageContent += `\nApplication Start Date: ${stateDetails["Application Start Date"]}`;
    messageContent += `\nApplication End Date: ${stateDetails["Application End Date"]}`;
    messageContent += `\nExam Date/Expected Month: ${stateDetails["Exam Date/Expected Month"]}`;
  } else {
    messageContent += `\n\n${stateDetails.error}`;
  }

  const messageData = {
    to: from,
    type: "text",
    text: {
      body: messageContent, // Full message content
    },
  };

  // Send the message
  try {
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  } catch (error) {
    console.error("Error sending message:", error); // Handle any errors during message sending
  }
}


  async sendLanguageSelectionMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.languageSelection;

    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: message,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: localisedStrings.language_english,
            reply: 'English',
          },
          {
            type: 'solid',
            body: localisedStrings.language_hindi,
            reply: 'hindi',
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
   
  /* async sendWhoCanApplyMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.getWhoCanApplyStrings,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
 */




 

}