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
    const message = localisedStrings.StateSelectionMessage;

    let states = [];
    try {
        const response = await axios.get(
            'https://script.google.com/macros/s/AKfycbwOHTUl17ZPwIw-m90UHDNyrovPifw6fQrSjUkmSprkka4UtEpJhFIUIkRqsJkjsPzNxA/exec',
            { params: { action: 'getStates' } }
        );
        if (response.data) {
            states = response.data; 
            localisedStrings.states = states; 
        } 
    } catch (error) {
        console.error('Error fetching states:', error);
        states = ['Unable to fetch states at the moment. Please try again later.'];
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
    try {
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    } catch (error) {
        console.error('Error sending message:', error); // Handle any errors during message sending
    }
}
    async StateSelectedinfo(from: string, language: string, selectedState: string) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.like;
    
      let stateDetails = null;
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbwOHTUl17ZPwIw-m90UHDNyrovPifw6fQrSjUkmSprkka4UtEpJhFIUIkRqsJkjsPzNxA/exec",
          {
            params: { action: "getStateDetails", state: selectedState },
          }
        );
        if (response.data) {
          stateDetails = response.data;
        }
      } catch (error) {
        console.error("Error fetching state details:", error);
        stateDetails = { error: "Unable to fetch state details at the moment. Please try again later." }; // Fallback on error
      }
    
      let messageContent = message;
      if (stateDetails && !stateDetails.error) {
        if (stateDetails["State Name"] && stateDetails["State Name"] !== "NA") {
          messageContent += `\n\nState Name: ${stateDetails["State Name"]}`;
        }
        if (stateDetails["Minimum Percentage (Class 7)"] && stateDetails["Minimum Percentage (Class 7)"] !== "NA") {
          messageContent += `\nMinimum Percentage (Class 7): ${stateDetails["Minimum Percentage (Class 7)"]}`;
        }
        if (stateDetails["Family Income Limit"] && stateDetails["Family Income Limit"] !== "NA") {
          messageContent += `\nFamily Income Limit: ${stateDetails["Family Income Limit"]}`;
        }
        if (stateDetails["Applicable Schools"] && stateDetails["Applicable Schools"] !== "NA") {
          messageContent += `\nApplicable Schools: ${stateDetails["Applicable Schools"]}`;
        }
        if (stateDetails["Application Mode"] && stateDetails["Application Mode"] !== "NA") {
          messageContent += `\nApplication Mode: ${stateDetails["Application Mode"]}`;
        }
        if (stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
          messageContent += `\nPortal/Website Link: ${stateDetails["Portal/Website Link"]}`;
        }
        if (stateDetails["Helpdesk Contact Number"] && stateDetails["Helpdesk Contact Number"] !== "NA") {
          messageContent += `\nHelpdesk Contact Number: ${stateDetails["Helpdesk Contact Number"]}`;
        }
        if (stateDetails["Application Start Date"] && stateDetails["Application Start Date"] !== "NA") {
          messageContent += `\nApplication Start Date: ${stateDetails["Application Start Date"]}`;
        }
        if (stateDetails["Application End Date"] && stateDetails["Application End Date"] !== "NA") {
          messageContent += `\nApplication End Date: ${stateDetails["Application End Date"]}`;
        }
        if (stateDetails["Exam Date/Expected Month"] && stateDetails["Exam Date/Expected Month"] !== "NA") {
          messageContent += `\nExam Date/Expected Month: ${stateDetails["Exam Date/Expected Month"]}`;
        }
      } else {
        messageContent += `\n\n${stateDetails.error}`;
      }
    
      const messageData = {
        to: from,
        type: "text",
        text: {
          body: messageContent, 
        },
      };
    
      try {
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
      } catch (error) {
        console.error("Error sending message:", error); 
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
 

}