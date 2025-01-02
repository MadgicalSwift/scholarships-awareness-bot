import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';

import { MessageService } from 'src/message/message.service';
import axios from 'axios';
import { CLIENT_RENEG_LIMIT } from 'tls';
dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private sheetAPI = process.env.Sheet_API;
  private moreBotAPI = process.env.moreBotAPI;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;
  private selectedStateStore: Map<string, string> = new Map();


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
            reply: localisedStrings.whoCanApply,
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
          
  storeSelectedState(conversationId: string, selectedState: string) {
    this.selectedStateStore.set(conversationId, selectedState);
  }
  getSelectedState(conversationId: string): string | undefined {
    return this.selectedStateStore.get(conversationId);
  }


  async sendStateSelectionButton(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.stateSelectionMessage;

    let states = [];
    
    try {
        const response = await axios.get(
          this.sheetAPI,
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
   
    if (states.length === 0) {
      states = ['Default State']; // Provide a default state or fallback message
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
async handleSelectedState(from, selectedState, language) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const confirmationMessage = localisedStrings.StateSelectionConfirmationMessage.replace("{state}", selectedState);

  try {
      // console.log(`User ${from} selected state: ${selectedState}`)
      const messageData = {
          to: from,
          type: 'text',
          text: {
              body: confirmationMessage, 
          },
      };

      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  } catch (error) {
      console.error('Error handling selected state:', error);
      const errorMessage = localisedStrings.StateSelectionErrorMessage;
      const messageData = {
          to: from,
          type: 'text',
          text: {
              body: errorMessage, // Error message to the user
          },
      };

      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
}

async StateSelectedinfo(from, language, selectedState) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  let stateDetails = null;
  let questionPapers = null;
  
  this.storeSelectedState(from, selectedState);
  try {
      // Fetch state details
      const stateResponse = await axios.get(
        this.sheetAPI,
          {
              params: { action: "getStateDetails", state: selectedState },
          }
      );
      if (stateResponse.data) {
          stateDetails = stateResponse.data;
          // console.log('stateDetails', stateDetails);
      }

      // Fetch question papers
      const questionPapersResponse = await axios.get(
        this.sheetAPI,
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
  let responseButtons = [];

  if (stateDetails && !stateDetails.error) {
      // Prepare message content
      const eligibilityCriteria = [         
          stateDetails["State Name"] && stateDetails["State Name"] !== "NA" && `• State Name: ${stateDetails["State Name"]}`,
          stateDetails["Minimum Percentage (Class 7)"] && stateDetails["Minimum Percentage (Class 7)"] !== "NA" && `• Minimum Percentage (Class 7): ${stateDetails["Minimum Percentage (Class 7)"]}`,
          stateDetails["Family Income Limit"] && stateDetails["Family Income Limit"] !== "NA" && `• Family Income Limit: ${stateDetails["Family Income Limit"]}`,
      ].filter(Boolean).join("\n");

      const applicationProcess = [
          stateDetails["Application Mode"] && stateDetails["Application Mode"] !== "NA" && `• Application Mode: ${stateDetails["Application Mode"]}`,
          stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA" && `• Portal/Website Link: ${stateDetails["Portal/Website Link"]}`,
          stateDetails["Helpdesk Contact Number"] && stateDetails["Helpdesk Contact Number"] !== "NA" && `• Helpdesk Contact Number: ${stateDetails["Helpdesk Contact Number"]}`,
      ].filter(Boolean).join("\n");

      const importantDates = [
          stateDetails["Application Start Date"] && stateDetails["Application Start Date"] !== "NA" && `• Application Start Date: ${stateDetails["Application Start Date"]}`,
          stateDetails["Application End Date"] && stateDetails["Application End Date"] !== "NA" && `• Application End Date: ${stateDetails["Application End Date"]}`,
          stateDetails["Exam Date/Expected Month"] && stateDetails["Exam Date/Expected Month"] !== "NA" && `• Exam Date/Expected Month: ${stateDetails["Exam Date/Expected Month"]}`,
      ].filter(Boolean).join("\n");

      messageContent += `📋 Eligibility Criteria:\n${eligibilityCriteria}\n\n📂 Application Process:\n${applicationProcess}\n\n📅 Important Dates:\n${importantDates}`;

      // Add conditional buttons
      if (stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
          responseButtons.push("See More");
          
      }

      if (stateDetails["Apply Now Link"] && stateDetails["Apply Now Link"] !== "NA") {
          responseButtons.push("Apply Now");
         
      }
      

  } else {
      messageContent += `\n\nUnable to fetch state details. Please try again later.`;
  }
  // console.log(stateDetails)
  if (questionPapers && !questionPapers.error) {
    let questionPaperDetails = "\n📚 Available Question Papers:\n";
    // questionPapers.forEach((paper, index) => {
    //     questionPaperDetails += `• ${paper["State"]} (${paper["Year"]}) - [PDF](${paper["PDF Link"]})\n`;
    // });
    

    
    responseButtons.push("See Question Papers");
    
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
      if (responseButtons.length > 0) {
          await this.sendButtonsBasedOnResponse(from, language, responseButtons);
      }
      else{
        console.log('there is no apply link, question paper, web link');
        let userData = await this.userService.findUserByMobileNumber(from, this.botId);
        console.log('there is no apply link, question paper, web link',userData,userData.seeMoreCount);
        if(userData.seeMoreCount==3){
          await this.moreBots(from, language);
        }
        else{
          await this.uLikeNext(from, language);
        }
      }
         
  } catch (error) {
      console.error("Error sending message:", error);
  }
}
async  getLinkForButton(from, language, selectedState, previousButton) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  let stateDetails = null;
  let questionPapers = null;

  try {
    // Fetch state details
    const stateResponse = await axios.get(
      this.sheetAPI,
      {
        params: { action: "getStateDetails", state: selectedState },
      }
    );
    if (stateResponse.data) {
      stateDetails = stateResponse.data;
    }

    // Fetch question papers
    const questionPapersResponse = await axios.get(
      this.sheetAPI,
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

  let link = "";

  if (previousButton === "Apply Now" && stateDetails && stateDetails["Apply Now Link"] && stateDetails["Apply Now Link"] !== "NA") {
    link = stateDetails["Apply Now Link"];
  } 
  // Handle other button actions
  else if (previousButton === "See More" && stateDetails && stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
    link = stateDetails["Portal/Website Link"];
  } 
  else if (previousButton === "See Question Papers" && questionPapers && questionPapers.length > 0) {
    // For "See Question Papers", we can return the first available question paper link as an example
    link = questionPapers[0]["PDF Link"];
  }

 
  return link; 
}

async sendButtonsBasedOnResponse(from, language, responseButtons) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const buttons = responseButtons.map((button) => {
      switch (button) {
          case "See More":
              return {
                  type: "solid",
                  body: localisedStrings.seeMore,
                  reply: localisedStrings.seeMore,
              };
          case "Apply Now":
              return {
                  type: "solid",
                  body: localisedStrings.applyNow,
                  reply: localisedStrings.applyNow,
              };
          case "See Question Papers":
              return {
                  type: "solid",
                  body: localisedStrings.seeQuestionPaper,
                  reply: localisedStrings.seeQuestionPaper,
              };
          default:
              return {
                  type: "solid",
                  body: button,
                  reply: button,
              };
      }
  });

  const messageData = {
      to: from,
      type: "button",
      button: {
          body: {
              type: "text",
              text: {
                  body: localisedStrings.buttonPrompt,
              },
          },
          buttons: buttons,
          allow_custom_response: false,
      },
  };

  return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
}
  async nextButton(from, language, selectedState, previousButton) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const link = await this.getLinkForButton(from, language, selectedState, previousButton);
  
  
 
  const messageData = {
      to: from,
      type: 'action',
      action: {
          body: {
              type: 'text',
              text: {
                  body: localisedStrings.sureNextButton,
              },
          },
          actions: [
              {
                  button_text: localisedStrings.Next,
                  type: "website",
                  website: {
                      title: "Welcome to Swiftchat",
                      payload: "qwerty",
                      url: link
                  }
              },
          ]
      }
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
            body: localisedStrings.languageEnglish,
            reply: 'English',
          },
          {
            type: 'solid',
            body: localisedStrings.languageHindi,
            reply: 'hindi',
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
 

  async feedbackMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.feedback;
  
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
            body: localisedStrings.sure,
            reply: localisedStrings.sure,
          },
          {
            type: 'solid',
            body: localisedStrings.NMMS1,
            reply: localisedStrings.NMMS1,
          },
          {
            type: 'solid',
            body: localisedStrings.checkState,
            reply: localisedStrings.checkState,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
 
  async uLikeNext(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.uLikeNext;
  
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
            body: localisedStrings.NMMS1,
            reply: localisedStrings.NMMS1,
          },
          {
            type: 'solid',
            body: localisedStrings.checkState || "Check for another State",
            reply: localisedStrings.checkState,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }

  async uLikeNextAfterMoreBot(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.uLikeNext;
  
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
            body: localisedStrings.checkState,
            reply: localisedStrings.checkState,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
 
  

  async moreBots(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.morebot,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async userfeedback(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.userfeedback,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async thankumessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.thankyou;
  
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
            body: localisedStrings.NMMS1,
            reply: localisedStrings.NMMS1,
          },
          {
            type: 'solid',
            body: localisedStrings.checkState,
            reply: localisedStrings.checkState,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
 
  


  // **********        question paper section

  async sendST21Message(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.ST21Message,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  
  async sendAfterPdfMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.like,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async fetchAndSendYearButtons(from: string, language: string, selectedState: string) {
    try {
        // console.log(`Fetching available years for state: ${selectedState}`);
        
        // Fetch available years
        const response = await axios.get(
            `https://script.google.com/macros/s/AKfycbw86coYv1DN5WUWHYW20XMlOBQ8CIt0-QzKEC1AkPyjM8L1CW8zYZX5AcjO50A5ymFFCg/exec?action=getAvailableYears&state=${selectedState}`
        );
        
        // Extract years from the response data
        const years: number[] = response.data.years;

        if (!years || years.length === 0) {
            console.log(`No years available for the state: ${selectedState}`);
            return;
        }

        // console.log("Available Years:", years);

        // Map years to button objects
        const localisedStrings = LocalizationService.getLocalisedString(language);
        const buttons = years.map((year) => ({
            type: "solid",
            body: year.toString(), // Display year as button text
            reply: year.toString(), // Send year as reply when clicked
        }));

        const messageData = {
            to: from,
            type: "button",
            button: {
                body: {
                    type: "text",
                    text: {
                        body: localisedStrings.yearSelectionPrompt,
                    },
                },
                buttons: buttons,
                allow_custom_response: false,
            },
        };

        // Send the year selection buttons
        return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    } catch (error) {
        console.error("Error fetching or sending year buttons:", error);
    }
}

async  fetchAndSendQuestionPaper(from: string, language: string, selectedState: string, selectedYear: number) {
  try {
      // Log selected year
      console.log(`Fetching question paper for state: ${selectedState} and year: ${selectedYear}`);
      
      // Fetch the PDF link for the selected year and state
      const response = await axios.get(
          `https://script.google.com/macros/s/AKfycbw86coYv1DN5WUWHYW20XMlOBQ8CIt0-QzKEC1AkPyjM8L1CW8zYZX5AcjO50A5ymFFCg/exec?action=getPdfLink&state=${selectedState}&year=${selectedYear}`
      );
      
      // Extract the PDF URL from the response
      // console.log("pdflink",response);
      
      const pdfUrl = response.data.pdfLink;
      // console.log('pdfURL',pdfUrl);
      
      const pdfName = `Answer Key - ${selectedState} - ${selectedYear}`;  // Customize the name as needed
      
      if (!pdfUrl) {
          console.log("No PDF found for the selected year and state.");
          return;
      }

      // console.log("PDF URL:", pdfUrl);

      // Send the PDF document to the user
      const messageData = {
          to: from, // Send to the recipient's mobile number
          type: "document",
          document: {
              url: pdfUrl,
              name: pdfName,
              body: `Question Paper for ${selectedState} - ${selectedYear}`,
              read_only: true
          }
      };

      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
    } catch (error) {
        console.error("Error fetching or sending year buttons:",error);
    }
}

async sendQuestionPaperButton(from: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const message = localisedStrings.uLikeNext;

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
          body: localisedStrings.SeeQuestionPaper1,
          reply: localisedStrings.SeeQuestionPaper1,
        },
        
      ],
      allow_custom_response: false,
    },
  };

  return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
}


async sendQuesPapaerNextMaessage(from: string, language: string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const requestData = this.prepareRequestData(
    from,
    localisedStrings.uLikeNext,
  );

  const response = await this.sendMessage(
    this.baseUrl,
    requestData,
    this.apiKey,
  );
  return response;
}

// try new 
async fetchAndStoreBots(from: string, language: string) {
  try {
      // API URL
      const apiUrl = this.moreBotAPI;

      // Fetch data using Axios
      const response = await axios.get(apiUrl);

      
      // Store data in an array
      const bots = response.data;
      
      if (bots.length === 0) {
          console.log('No bots found in the API response.');
          return;
      }

      

      return bots;
  } catch (error) {
      console.error('Error fetching bots:', error);
  }
}
async  asyncFetchAndSendBotButtons(from: string, language: string) {
  try {
      // Fetch bots
      const bots = await this.fetchAndStoreBots(from,language);

      if (!bots || bots.length === 0) {
          console.log('No bots available to send as buttons.');
          return;
      }

      // Map bots to article objects
      const articles = bots.map((bot) => ({
  
          title: bot.botName, 
          header: {
              type: "image",
              image: {
                  url: bot.imageUrl,
                  body: "Sample caption",
              },
          },
          description: bot.description,
          actions: [
              {
                  button_text: "Go To Website",
                  type: "website",
                  website: {
                      title: "Welcome to Swiftchat",
                     
                      url: bot.botLink,
                      
                  },
              },
          ],
      }));

      const messageData = {
          to: from,
          type: "article",
          article: articles,
      };

      // Send the bot articles
      return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  } catch (error) {
      console.error('Error fetching or sending bot articles:', error);
  }
}


}