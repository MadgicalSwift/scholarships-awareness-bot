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
    const message = localisedStrings.languageChangedMessage;
    
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

    const cacheKey = 'updated_states_new'; 
  let states = [];

  try {
    
      // Check if states are cached in Redis
    const cachedStates = await this.redisService.get(cacheKey);

    if (cachedStates) {
      // If cached, use the data from Redis
      states = JSON.parse(cachedStates).sort((a, b) => a.localeCompare(b));
      localisedStrings.states = states;
    }
    else 
     {
      // If not cached, fetch from API
      const response = await axios.get(this.sheetAPI, {
        params: { action: 'getStates' },
      });

      if (response.data) {
        states = response.data.sort((a, b) => a.localeCompare(b));
        localisedStrings.states = states;

        // Cache the fetched states in Redis with a TTL (time-to-live)
        await this.redisService.set(cacheKey,JSON.stringify(states));
      }
    }

  } catch (error) {
    console.error('Error fetching states:', error);
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

  const cacheKey = `updatedstateDetailsnew:${selectedState}`;
  const questionPapersCacheKey = `updatedquestionPapersyearnew:${selectedState}`;

  try {

    const cachedStateDetails = await this.redisService.get(cacheKey);
    const cachedQuestionPapers = await this.redisService.get(questionPapersCacheKey);

    if (cachedStateDetails && cachedQuestionPapers) {
      stateDetails = JSON.parse(cachedStateDetails);
      questionPapers = JSON.parse(cachedQuestionPapers);
      console.log("questio paper",questionPapers)
    } else {
      // Fetch both APIs in parallel
      const [stateResponse, questionPapersResponse] = await Promise.all([
        axios.get(this.sheetAPI, { params: { action: "getStateDetails", state: selectedState } }),
        axios.get(this.sheetAPI, { params: { action: "getAvailableYears", state: selectedState } }),
      ]);
      console.log("questio paper",questionPapersResponse)
      stateDetails = stateResponse?.data || null;
      questionPapers = questionPapersResponse?.data || null;
      console.log('stateDetails=>',stateDetails);
  

      // Cache the results in Redis

      if (stateDetails) {
        await this.redisService.set(cacheKey, JSON.stringify(stateDetails));
      }
      if (questionPapers) {
        await this.redisService.set(questionPapersCacheKey, JSON.stringify(questionPapers));
      }
    }


  } catch (error) {
    console.error("Error fetching data:", error);
    return;
  }

  let messageContent = "";
  let responseButtons = [];

  if (stateDetails && !stateDetails.error) {
      // Prepare content dynamically
     
          // stateDetails["State Name"] && `*• State Name: ${stateDetails["State Name"]}*`,
          const filterNA = (value) => value && value !== "NA";
const formatDate = (date) => {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    } else if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
        return date.split('T')[0];
    }
    return date;
};

const eligibilityCriteria = [
    filterNA(stateDetails["Minimum Percentage (Class 7)"]) && `• Minimum Percentage (Class 7): *${stateDetails["Minimum Percentage (Class 7)"]}*`,
    filterNA(stateDetails["Family Income Limit"]) && `• Family Income Limit: *${stateDetails["Family Income Limit"]}*`,
    filterNA(stateDetails["Applicable Schools"]) && `*• Applicable Schools:* ${stateDetails["Applicable Schools"]}`,
].filter(Boolean).join("\n");

const applicationProcess = [
    filterNA(stateDetails["Application Mode"]) && `*• Application Mode:* ${stateDetails["Application Mode"]}`,
    filterNA(stateDetails["Portal/Website Link"]) && `*• Portal/Website Link: ${stateDetails["Portal/Website Link"]}*`,
    filterNA(stateDetails["Helpdesk Contact Number"]) && `*• Helpdesk Contact Number: ${stateDetails["Helpdesk Contact Number"]}*`,
].filter(Boolean).join("\n");

const importantDates = [
    filterNA(stateDetails["Application Start Date"]) && `• Application Start Date: *${formatDate(stateDetails["Application Start Date"])}*`,
    filterNA(stateDetails["Application End Date"]) && `• Application End Date: *${formatDate(stateDetails["Application End Date"])}*`,
    filterNA(stateDetails["Exam Date/Expected Month"]) && `• Exam Date/Expected Month: *${formatDate(stateDetails["Exam Date/Expected Month"])}*`,
].filter(Boolean).join("\n");

       messageContent = ` *NMMS Details for ${stateDetails["State Name"]}* \n\n`;
if (eligibilityCriteria) messageContent += `1️⃣ *Eligibility Criteria:*\n${eligibilityCriteria}\n\n`;
if (applicationProcess) messageContent += `2️⃣ *Application Process:*\n${applicationProcess}\n\n`;
if (importantDates) messageContent += `3️⃣ *Important Dates:*\n${importantDates} \n\n`;
messageContent += "What would you like to do next?";
      if (stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"]!= "NA" ) responseButtons.push("View Website");
      if (stateDetails["Apply Now Link"] && stateDetails["Apply Now Link"]!= "NA") responseButtons.push("Apply Now");
      if (questionPapers && !questionPapers?.error) responseButtons.push("See Question Papers");

  }

  const messageData = {
      to: from,
      type: "text",
      text: { body: messageContent },
  };

  try {
      await this.sendMessage(this.baseUrl, messageData, this.apiKey);

      if (responseButtons.length > 0) {
          await this.sendButtonsBasedOnResponse(from, language, responseButtons);
      } else {
          const userData = await this.userService.findUserByMobileNumber(from, this.botId);
          if (userData.seeMoreCount === 3) {
              await this.moreBots(from, language);
          } else {
              await this.uLikeNext(from, language);
          }
      }
  } catch (error) {
      console.error("Error sending message:", error);
  }
}




async getApplyOrSeeMoreLink(from, language, selectedState, previousButton) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  let stateDetails = null;
  const cacheKey = `updatestateDetails_${selectedState}`; // Use selectedState as part of the cache key

  try {

      // Check if state details are cached in Redis
    const cachedStateDetails = await this.redisService.get(cacheKey);

    if (cachedStateDetails) {
      // If cached, use the data from Redis
      console.log("Fetching state details from cache.");
      stateDetails = JSON.parse(cachedStateDetails);
    } else {
      // If not cached, fetch from the API
      const stateResponse = await axios.get(this.sheetAPI, {
        params: { action: "getStateDetails", state: selectedState },
      });
      if (stateResponse.data) {
        stateDetails = stateResponse.data;

        // Cache the fetched state details in Redis with a TTL (time-to-live)
        await this.redisService.set(cacheKey, JSON.stringify(stateDetails));
      }
    }

  } catch (error) {
    console.error("Error fetching state details:", error);
  }

  let link = "";

  if (previousButton === localisedStrings.applyNow && stateDetails && stateDetails["Apply Now Link"] && stateDetails["Apply Now Link"] !== "NA") {
    link = stateDetails["Apply Now Link"];
  } else if (previousButton === localisedStrings.viewWebsite && stateDetails && stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
    link = stateDetails["Portal/Website Link"];
  }
  return link;
}


async getQuestionPaperLink(from, language, selectedState) {
  let questionPapers = null;
  const cacheKey = `updatequestionPapers_${selectedState}`; // Use selectedState as part of the cache key

  try {
    
      // Check if question papers are cached in Redis
    const cachedQuestionPapers = await this.redisService.get(cacheKey);

    if (cachedQuestionPapers) {
      // If cached, use the data from Redis
      console.log("Fetching question papers from cache.");
      questionPapers = JSON.parse(cachedQuestionPapers);
    } else {
      // If not cached, fetch from the API
      const questionPapersResponse = await axios.get(this.sheetAPI, {
        params: { action: "getQuestionPaper", state: selectedState },
      });
      if (questionPapersResponse.data) {
        questionPapers = questionPapersResponse.data;

        // Cache the fetched question papers in Redis with a TTL (time-to-live)
        await this.redisService.set(cacheKey, JSON.stringify(questionPapers));
      }
    }
  } catch (error) {
    console.error("Error fetching question papers:", error);
  }

  let link = "";

  if (questionPapers && questionPapers.length > 0) {
    // Return the first available question paper link
    link = questionPapers[0]["PDF Link"];
  }

  return link;
}


async sendButtonsBasedOnResponse(from, language, responseButtons) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const buttons = responseButtons.map((button) => {
      switch (button) {
          case "View Website":
              return {
                  type: "solid",
                  body: localisedStrings.viewWebsite,
                  reply: localisedStrings.viewWebsite,
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
  const link = await this.getApplyOrSeeMoreLink(from, language, selectedState, previousButton);
  const button_body = localisedStrings.Next(previousButton)
  console.log("linkkkkkkkkkkkkkkkkkk",link)
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
                  // button_text: localisedStrings.Next,
                  button_text: button_body,
                  type: "website",
                  website: {
                      title: "Welcome to Swiftchat",
                     
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
            body: localisedStrings.checkState,
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
      localisedStrings.moreBot,
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
    let years: number[] = [];
  const cacheKey = `updateavailableYears_${selectedState}`;
    try {
       // Check if available years are cached in Redis
    const cachedYears = await this.redisService.get(cacheKey);

    if (cachedYears) {
      // If cached, use the data from Redis
      console.log("Fetching available years from cache.");
      years = JSON.parse(cachedYears);
    } else {
      // If not cached, fetch from the API
      const response = await axios.get(this.sheetAPI, {
        params: { action: "getAvailableYears", state: selectedState }
      });

      if (response.data && response.data.years) {
        years = response.data.years;

        // Cache the fetched years in Redis with a TTL (time-to-live)
        await this.redisService.set(cacheKey, JSON.stringify(years)); 
      }
      }   

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



async fetchAndSendQuestionPaper(from: string, language: string, selectedState: string, selectedYear: number) {
  let listPdfUrl;
  const cacheKey = `updatepdfLink_${selectedState}_${selectedYear}`;

  try {
      // Fetch PDF links from API
      const response = await axios.get(this.sheetAPI, {
          params: { action: "getPdfLink", state: selectedState, year: selectedYear },
      });

      if (response.data && response.data.pdfList) {
          listPdfUrl = response.data.pdfList;
      }

      if (!listPdfUrl || listPdfUrl.length === 0) {
          console.error("No PDFs found for the selected state and year.");
          return;
      }

      // Send multiple PDFs using Promise.all
      const sendMessages = listPdfUrl.map(pdf => {
          const messageData = {
              to: from,
              type: "document",
              document: {
                  url: pdf.pdfLink,
                  name: pdf.title || `Question Paper - ${selectedState} - ${selectedYear}`,
                  body: pdf.subTitle || `PDF Document`,
                  read_only: true
              }
          };
          return this.sendMessage(this.baseUrl, messageData, this.apiKey);
      });

      // Execute all send requests
      await Promise.all(sendMessages);
      console.log("All PDFs sent successfully!");
  } catch (error) {
      console.error("Error fetching or sending PDFs:", error);
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
          body: localisedStrings.seeQuestionPaper,
          reply: localisedStrings.seeQuestionPaper,
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
  const cacheKey = `updatedbots_${from}_${language}`; // Create a unique cache key
  let bots: any[] = [];

  try {
    // Check if data is cached
    const cachedBots = await this.redisService.get(cacheKey);

    if (cachedBots) {
      // If cached, parse and use the data
      console.log("Fetching bots from cache.");
      bots = JSON.parse(cachedBots);
    } else {
      // If not cached, fetch data from the API
      const response = await axios.get(this.sheetAPI, {
        params: { action: 'getBots' },
      });

      // Store the fetched bots data
      bots = response.data;

      if (bots.length === 0) {
        return bots;
      }

      // Cache the bots data in Redis with a TTL (e.g., 1 hour)
      await this.redisService.set(cacheKey, JSON.stringify(bots)); // 1 hour TTL
    }
  }
   catch (error) {
    console.error('Error fetching bots:', error);
  }

  return bots;
}


async asyncFetchAndSendBotButtons(from: string, language: string) {
  try {
    const cacheKey = 'updatedbots_cache'; // Unique key for caching bots
    let bots: any[] = [];

    // Check Redis cache for bots data
    const cachedBots = await this.redisService.get(cacheKey);
    if (cachedBots) {
      console.log("Fetching bots from cache.");
      bots = JSON.parse(cachedBots);
    } else {
      // Fetch bots from the API
      const response = await axios.get(this.sheetAPI, {
        params: { action: 'getBots' },
      });
      bots = response.data;

     

      // Cache the bots data in Redis with a TTL (e.g., 1 hour)
      await this.redisService.set(cacheKey, JSON.stringify(bots), 'EX', 3600); // TTL = 1 hour
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
