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
        let stateDetails = null;
        let questionPapers = null;
    
        try {
            // Fetch state details
            const stateResponse = await axios.get(
                "https://script.google.com/macros/s/AKfycbzWjR-Map-oXdmoDd77-y9ifpuu1Ji8k1T9BjVzNM3U5XQ-GZJpLKeVqL4ABCJJ9s4djA/exec",
                {
                    params: { action: "getStateDetails", state: selectedState },
                }
            );
            if (stateResponse.data) {
                stateDetails = stateResponse.data;
            }
    
            // Fetch question papers
            const questionPapersResponse = await axios.get(
                "https://script.google.com/macros/s/AKfycbzWjR-Map-oXdmoDd77-y9ifpuu1Ji8k1T9BjVzNM3U5XQ-GZJpLKeVqL4ABCJJ9s4djA/exec",
                {
                    params: { action: "getQuestionPaper", state: selectedState },
                }
            );
            if (questionPapersResponse.data) {
                questionPapers = questionPapersResponse.data;
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    
        let messageContent = "";
        let responseMessage = [];
    
        if (stateDetails && !stateDetails.error) {
            // Process state details
            const eligibilityCriteria = [
                stateDetails["State Name"] && `• State Name: ${stateDetails["State Name"]}`,
                stateDetails["Minimum Percentage (Class 7)"] && `• Minimum Percentage (Class 7): ${stateDetails["Minimum Percentage (Class 7)"]}`,
                stateDetails["Family Income Limit"] && `• Family Income Limit: ${stateDetails["Family Income Limit"]}`,
            ].filter(Boolean).join("\n");
    
            const applicationProcess = [
                stateDetails["Application Mode"] && `• Application Mode: ${stateDetails["Application Mode"]}`,
                stateDetails["Portal/Website Link"] && `• Portal/Website Link: ${stateDetails["Portal/Website Link"]}`,
                stateDetails["Helpdesk Contact Number"] && `• Helpdesk Contact Number: ${stateDetails["Helpdesk Contact Number"]}`,
            ].filter(Boolean).join("\n");
    
            const importantDates = [
                stateDetails["Application Start Date"] && `• Application Start Date: ${stateDetails["Application Start Date"]}`,
                stateDetails["Application End Date"] && `• Application End Date: ${stateDetails["Application End Date"]}`,
                stateDetails["Exam Date/Expected Month"] && `• Exam Date/Expected Month: ${stateDetails["Exam Date/Expected Month"]}`,
            ].filter(Boolean).join("\n");
    
            messageContent += `📋 Eligibility Criteria:\n${eligibilityCriteria}\n\n📂 Application Process:\n${applicationProcess}\n\n📅 Important Dates:\n${importantDates}`;
            responseMessage.push("Apply Now", "See More");
        } else {
            messageContent += `\n\nUnable to fetch state details. Please try again later.`;
        }
    
        if (questionPapers && !questionPapers.error) {
            let questionPaperDetails = "\n📚 Available Question Papers:\n";
            questionPapers.forEach((paper, index) => {
                questionPaperDetails += `• ${paper["State"]} (${paper["Year"]}) - [PDF](${paper["PDF Link"]})\n`;
            });
            messageContent += questionPaperDetails;
            responseMessage.push("See Question Papers");
        }
    
        const messageData = {
            to: from,
            type: "text",
            text: {
                body: messageContent,
            },
        };
    
        try {
            await this.sendMessage(this.baseUrl, messageData, this.apiKey);
            if (responseMessage.length > 0) {
                await this.sendButtonsBasedOnResponse(from, language, responseMessage);
            }
        } catch (error) {
            console.error("Error sending message:", error);
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