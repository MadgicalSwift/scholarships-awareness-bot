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

    const cacheKey = 'states'; // Redis cache key for states
  let states = [];

  try {
    // Check if states are cached in Redis
    const cachedStates = await this.redisService.get(cacheKey);

    if (cachedStates) {
      // If cached, use the data from Redis
      states = JSON.parse(cachedStates);
      localisedStrings.states = states;
    } else {
      // If not cached, fetch from API
      const response = await axios.get(this.sheetAPI, {
        params: { action: 'getStates' },
      });

      if (response.data) {
        states = response.data;
        localisedStrings.states = states;

        // Cache the fetched states in Redis with a TTL (time-to-live)
        await this.redisService.set(cacheKey, JSON.stringify(states));
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

  const cacheKey = `stateDetails:${selectedState}`;
  const questionPapersCacheKey = `questionPapers:${selectedState}`;

  try {
    // Check Redis cache
    const cachedStateDetails = await this.redisService.get(cacheKey);
    const cachedQuestionPapers = await this.redisService.get(questionPapersCacheKey);

    if (cachedStateDetails && cachedQuestionPapers) {
      stateDetails = JSON.parse(cachedStateDetails);
      questionPapers = JSON.parse(cachedQuestionPapers);
    } else {
      // Fetch both APIs in parallel
      const [stateResponse, questionPapersResponse] = await Promise.all([
        axios.get(this.sheetAPI, { params: { action: "getStateDetails", state: selectedState } }),
        axios.get(this.sheetAPI, { params: { action: "getAvailableYears", state: selectedState } }),
      ]);

      stateDetails = stateResponse?.data || null;
      questionPapers = questionPapersResponse?.data || null;

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
      // Add buttons
      if (stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"]!= "NA" ) responseButtons.push("See More");
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
  const cacheKey = `stateDetails_${selectedState}`; // Use selectedState as part of the cache key

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

  if (previousButton === "Apply Now" && stateDetails && stateDetails["Apply Now Link"] && stateDetails["Apply Now Link"] !== "NA") {
    link = stateDetails["Apply Now Link"];
  } else if (previousButton === "See More" && stateDetails && stateDetails["Portal/Website Link"] && stateDetails["Portal/Website Link"] !== "NA") {
    link = stateDetails["Portal/Website Link"];
  }
  return link;
}


async getQuestionPaperLink(from, language, selectedState) {
  let questionPapers = null;
  const cacheKey = `questionPapers_${selectedState}`; // Use selectedState as part of the cache key

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
  const link = await this.getApplyOrSeeMoreLink(from, language, selectedState, previousButton);
  
  
 
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
  const cacheKey = `availableYears_${selectedState}`;
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

async  fetchAndSendQuestionPaper(from: string, language: string, selectedState: string, selectedYear: number) {
  let pdfUrl: string | null = null;
  const cacheKey = `pdfLink_${selectedState}_${selectedYear}`;
  try {
      // Check if the PDF link is cached in Redis
    const cachedPdfUrl = await this.redisService.get(cacheKey);

    if (cachedPdfUrl) {
      // If cached, use the data from Redis
      console.log("Fetching PDF link from cache.");
      pdfUrl = cachedPdfUrl;
    } else {
      // If not cached, fetch from the API
      const response = await axios.get(this.sheetAPI, {
        params: { action: "getPdfLink", state: selectedState, year: selectedYear },
      });

      if (response.data && response.data.pdfLink) {
        pdfUrl = response.data.pdfLink;

        // Cache the fetched PDF link in Redis with a TTL (time-to-live)
        await this.redisService.set(cacheKey, pdfUrl);
      }
    }
      
      const pdfName = `Answer Key - ${selectedState} - ${selectedYear}`;  // Customize the name as needed
      

     

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
  const cacheKey = `bots_${from}_${language}`; // Create a unique cache key
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
  } catch (error) {
    console.error('Error fetching bots:', error);
  }

  return bots;
}


async asyncFetchAndSendBotButtons(from: string, language: string) {
  try {
    const cacheKey = 'bots_cache'; // Unique key for caching bots
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