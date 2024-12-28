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
          
  storeSelectedState(conversationId: string, selectedState: string) {
    this.selectedStateStore.set(conversationId, selectedState);
  }
  getSelectedState(conversationId: string): string | undefined {
    return this.selectedStateStore.get(conversationId);
  }





  async sendStateSelectionButton(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.StateSelectionMessage;

    let states = [];
    
    try {
        const response = await axios.get(
            'https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec',
            { params: { action: 'getStates' } }
        );
        
        if (response.data) {
          states = response.data; 
          console.log('state',states)
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
      console.log(`User ${from} selected state: ${selectedState}`)
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
          "https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec",
          {
              params: { action: "getStateDetails", state: selectedState },
          }
      );
      console.log( " stateresponse data",stateResponse.data);
      if (stateResponse.data) {
          stateDetails = stateResponse.data;
          console.log('stateDetails', stateDetails);
      }

      // Fetch question papers
      const questionPapersResponse = await axios.get(
          "https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec",
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
      questionPapers.forEach((paper, index) => {
          questionPaperDetails += `• ${paper["State"]} (${paper["Year"]}) - [PDF](${paper["PDF Link"]})\n`;
      });
      messageContent += questionPaperDetails;

      // Add "See Question Papers" button
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
      "https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec",
      {
        params: { action: "getStateDetails", state: selectedState },
      }
    );
    if (stateResponse.data) {
      stateDetails = stateResponse.data;
    }

    // Fetch question papers
    const questionPapersResponse = await axios.get(
      "https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec",
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
                  body: localisedStrings.seeQuestionPaper1||'See Question Papers',
                  reply: localisedStrings.SeeQuestionPaper1||'See Question Papers',
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
                  body: localisedStrings.surenextbutton,
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
            body: localisedStrings.checkstate,
            reply: localisedStrings.checkstate,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
 
  async ulikenext(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.ulikenext;
  
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
            body: localisedStrings.checkstate,
            reply: localisedStrings.checkstate,
          },
        ],
        allow_custom_response: false,
      },
    };

    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
 
  async morebots(from: string, language: string) {
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
            body: localisedStrings.checkstate,
            reply: localisedStrings.checkstate,
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
/*
  async sendDocumentByUrl(from: string, documentUrl: string, language: string) {
    console.log('documentUrl',documentUrl);
    
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const messageData = {
      to: from,
      type: 'document',
      document: {
        url: "https://dkofefwp84vv0.cloudfront.net/CG+Summer+Special+Bots/Exam+Prep+Bot/Previous+Year+Question+Papers/CBSE/Class+10/2019/Eng+Lang+%26+Lit/2-1-1+Eng.L.L..pdf", // The URL of the document to send
        name: "Answer Key - Class 5 - Science - Week 25 - 8/1/2022",
        body: "Answer Key - Class 5 - Science - Week 25 - 8/1/2022",
        read_only: true
      },
    };
  
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }

  async fetchAndSendQuestionPaper(from: string, language: string, selectedState: string) {
    console.log('from:',from, 'language:',language,'selectState:',selectedState)
    try {
      // Fetch question paper data from API
      const questionPapersResponse = await axios.get(
        "https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec",
        {
          params: { action: "getQuestionPaper", state: selectedState },
        }
      );
  
      console.log('data',questionPapersResponse.data[0]['PDF Link']);
      
      // Check if response has data
      if (questionPapersResponse.data) {
        const documentLink = questionPapersResponse.data[0]['PDF Link']; // Assume the response has a `documentLink` field
  
        // Create buttons for each question paper
      const buttons = documentLink.map((paper: any) => ({
        type: "reply",
        title: `${paper['Year']} - ${paper['State']}`,
        payload: JSON.stringify({ url: paper['PDF Link'], name: paper['State'], year: paper['Year'] }),
      }));

      // Send message with buttons
      const messageData = {
        to: from,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: "Please select a question paper:",
          },
          action: {
            buttons: buttons,
          },
        },
      };


        // Call sendDocumentByUrl to send the fetched document link
        let docu = await this.sendDocumentByUrl(from, documentLink, language);
        console.log("Question paper sent successfully!",docu);
      } else {
        console.error("No question paper found for the selected state.");
      }
    } catch (error) {
      console.error("Error fetching question paper data:", error);
    }
  }
    */

  async sendDocumentByUrl(from: string, documentUrl: string, language: string) {
    console.log('Sending document with URL:', documentUrl);
  
    const messageData = {
      to: from,
      type: 'document',
      document: {
        url: documentUrl, // Dynamic document URL
        name: "Selected Question Paper", // Dynamic or generic name
        body: "Here is the selected question paper.", // Description
        read_only: true,
      },
    };
  
    try {
      const response = await this.sendMessage(this.baseUrl, messageData, this.apiKey);
      console.log("Document sent successfully!", response);
      return response;
    } catch (error) {
      console.error("Error sending document:", error);
      throw error;
    }
  }
  
  async fetchAndSendQuestionPaper(from: string, language: string, selectedState: string) {  
    try {
      // Fetch question papers data from API
      const questionPapersResponse = await axios.get(
        "https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec",
        {
          params: { action: "getQuestionPaper", state: selectedState },
        }
      );
  
      const questionPapers = questionPapersResponse.data;
  
      // Validate the response data
      if (questionPapers && questionPapers.length > 0) {
        // Create buttons dynamically
        const buttons = questionPapers.map((paper: any) => ({
          type: "reply", // Ensure the type is "reply" for buttons
          title: `${paper['Year']} - ${paper['State']}`, // Display year and state
          payload: paper['PDF Link'], // Pass the PDF link directly as payload
        }));
  
        // Send buttons to the user
        const messageData = {
          to: from,
          type: 'button', // Use "interactive" type for buttons
          interactive: {
            type: "button", // Specify the interactive type as "button"
            body: {
              text: "Please select a question paper:",
            },
            action: {
              buttons: buttons, // Assign the array of buttons
            },
          },
        };
  
        await this.sendMessage(this.baseUrl, messageData, this.apiKey);
        console.log("Question paper buttons sent successfully!");
      } else {
        console.error("No question papers found for the selected state.");
      }
    } catch (error) {
      console.error("Error fetching question paper data:", error);
    }
  }
  
  
  async handleButtonClick(from: string, payload: string, language: string) {
    console.log("Button clicked, payload:", payload);
  
    try {
      // When a button is clicked, the payload contains the document URL
      const documentUrl = payload;
  
      // Send the document to the user
      await this.sendDocumentByUrl(from, documentUrl, language);
    } catch (error) {
      console.error("Error handling button click:", error);
    }
  }  
  
  

}