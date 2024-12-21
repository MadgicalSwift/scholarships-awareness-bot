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
    async StateSelectedinfo(from, language, selectedState) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const message = localisedStrings.like;
    
      let stateDetails = null;
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycbzWjR-Map-oXdmoDd77-y9ifpuu1Ji8k1T9BjVzNM3U5XQ-GZJpLKeVqL4ABCJJ9s4djA/exec",
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
      let group1HasNA = false;
      let group2HasNA = false;
    
      if (stateDetails && !stateDetails.error) {
        // Group 1: Eligibility Criteria
        let group1 = "📋 Eligibility Criteria:\n";
        if (stateDetails["State Name"] && stateDetails["State Name"] !== "NA") {
          group1 += `• State Name: ${stateDetails["State Name"]}\n`;
        } else {
          group1HasNA = true; // Flag if NA is found
        }
        if (stateDetails["Minimum Percentage (Class 7)"] && stateDetails["Minimum Percentage (Class 7)"] !== "NA") {
          group1 += `• Minimum Percentage (Class 7): ${stateDetails["Minimum Percentage (Class 7)"]}\n`;
        } else {
          group1HasNA = true; // Flag if NA is found
        }
        if (stateDetails["Family Income Limit"] && stateDetails["Family Income Limit"] !== "NA") {
          group1 += `• Family Income Limit: ${stateDetails["Family Income Limit"]}\n`;
        } else {
          group1HasNA = true; // Flag if NA is found
        }
    
        // Group 2: Application Process
        let group2 = "\n📂 Application Process:\n";
        if (stateDetails["Application Mode"] && stateDetails["Application Mode"] !== "NA") {
          group2 += `• Application Mode: ${stateDetails["Application Mode"]}\n`;
        } else {
          group2HasNA = true; // Flag if NA is found
        }
        if (stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
          group2 += `• Portal/Website Link: ${stateDetails["Portal/Website Link"]}\n`;
        } else {
          group2HasNA = true; // Flag if NA is found
        }
        if (stateDetails["Helpdesk Contact Number"] && stateDetails["Helpdesk Contact Number"] !== "NA") {
          group2 += `• Helpdesk Contact Number: ${stateDetails["Helpdesk Contact Number"]}\n`;
        } else {
          group2HasNA = true; // Flag if NA is found
        }
    
        // Group 3: Important Dates
        let group3 = "\n📅 Important Dates:\n";
        if (stateDetails["Application Start Date"] && stateDetails["Application Start Date"] !== "NA") {
          group3 += `• Application Start Date: ${stateDetails["Application Start Date"]}\n`;
        }
        if (stateDetails["Application End Date"] && stateDetails["Application End Date"] !== "NA") {
          group3 += `• Application End Date: ${stateDetails["Application End Date"]}\n`;
        }
        if (stateDetails["Exam Date/Expected Month"] && stateDetails["Exam Date/Expected Month"] !== "NA") {
          group3 += `• Exam Date/Expected Month: ${stateDetails["Exam Date/Expected Month"]}\n`;
        }
        console.log(stateDetails);
        // Combine all groups
        messageContent += `\n\n${group1}${group2}${group3}`;
        const messageData = {
          to: from,
          type: "text",
          text: {
            body: messageContent,
          },
        };
    
        try {
          await this.sendMessage(this.baseUrl, messageData, this.apiKey);
        } catch (error) {
          console.error("Error sending state details message:", error);
        }
         
        let responseMessage = [];
        if (stateDetails["Apply Now Link"] && stateDetails["Apply Now Link"] !== "NA") {
            responseMessage.push("Apply Now");
        }
        if (stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
            responseMessage.push("See More");
        }
        if (stateDetails["question paper"] && stateDetails["question paper"] !== "NA") {
            responseMessage.push("See Question Papers");
        }
        // Step 2: Call the function to send buttons
        if (responseMessage.length > 0) {
            await this.sendButtonsBasedOnResponse(from, language, responseMessage);
        } else {
            // Handle case where no buttons need to be sent
            console.log("No options available at the moment.");
        }

           
      } else {
        messageContent += `\n\n${stateDetails.error}`;
        // Send error message to the user
        const messageData = {
          to: from,
          type: "text",
          text: {
            body: messageContent,
          },
        };
    
        try {
          await this.sendMessage(this.baseUrl, messageData, this.apiKey);
        } catch (error) {
          console.error("Error sending state error message:", error);
        }
      }
    }
     

    async sendButtonsBasedOnResponse(from, language, responseMessage) {
      const localisedStrings = LocalizationService.getLocalisedString(language);
      const buttons = responseMessage.map((message) => {
          switch (message) {
              case "Apply Now":
                  return {
                      type: 'solid',
                      body: localisedStrings.applyNow || "Apply Now", 
                      reply: localisedStrings.applyNow || "Apply Now",
                  };
              case "See More":
                  return {
                      type: 'solid',
                      body: localisedStrings.seeMore || "See More",
                      reply: localisedStrings.seeMore || "See More",
                  };
              case "See Question Papers":
                  return {
                      type: 'solid',
                      body: localisedStrings.seeQuestionPapers || "See Question Papers",
                      reply: localisedStrings.seeQuestionPapers || "See Question Papers",
                  };
              default:
                  return {
                      type: 'solid',
                      body: message,
                      reply: message,
                  };
          }
      });
      const messageData = {
          to: from,
          type: 'button',
          button: {
              body: {
                  type: 'text',
                  text: {
                      body: localisedStrings.buttonPrompt, 
                  },
              },
              buttons: buttons,
              allow_custom_response: false, 
          },
      };
      // Send the message using your messaging method
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }




      async Surebutton(from: string, language: string) {
        const localisedStrings = LocalizationService.getLocalisedString(language);
        const message = localisedStrings.surenextbutton;
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
                body: localisedStrings.Next,
                reply: localisedStrings.Next,
              },
            ],
            allow_custom_response: false,
          },
        };
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
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