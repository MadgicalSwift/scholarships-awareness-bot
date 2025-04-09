import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
export const localisedStrings = {
  welcomeMessage: '👋 Hi! I am here to tell you about the NMMS Scholarship! 🌟\n\n🎓 The National Means-cum-Merit Scholarship (NMMS) is for students in Class 8 who are bright but need some help to continue their education.\n\n📚 If you qualify, you can get ₹12,000 a year for studies until Class 12!\n\nPlease choose your language to get started.',
  seeMoreMessage: 'See More Data',
  languageHindi: 'हिन्दी',
  languageEnglish: 'English',
  userLanguage:'english',
  languageChangedMessage: "🎉 *Great! You have selected English. Let us get started!* 🎓\n\n🌟 *What is NMMS?*\nThe NMMS Scholarship is a program for *Class 8 students* to support their education. If you qualify, you’ll receive *₹12,000 per year* (₹1,000 per month) until Class 12!",
  languageSelection: 'Please choose your language to get started!',
  whoCanApplyPrompt:"Please click the button below to learn more:",
  whoCanApply:"🎯 Who Can Apply",
  getWhoCanApplyStrings: "1️⃣ You must be in *Class 8* at a government, government-aided or local body school.\n 2️⃣You should have scored at least *55% marks in Class 7* ( 50% for SC/ST students ).\n 3️⃣ Your family’s total income should be *less than ₹3.5 Lakhs per year.*",
  next: "Next",
  howCanSelected:'📝 How can I get selected?',
  selectedMessage:'You will need to take an exam. The exam has two sections:\n *• Mental Ability Test(MAT):* To test problem-solving and logical thinking. \n *• Scholastic Ability Test (SAT):* Questions based on your school subjects like Science, Maths and Social Studies.',
  stateSelectionMessage: 'For which state do you want to see the information available?',
  like:'What would you like to do next',
  applyNow: 'Apply Now',
  viewWebsite: 'View Website',
 seeQuestionPaper: 'See Question Papers',
 sureNextButton: "Please click on the button below to view the website.",
 buttonPrompt:"Choose an option:",
//  Next: "View Website",
 Next : (previousButton) =>   `${previousButton}`,
 feedback: "We would love to hear any feedback you may have to make this bot better 🔍\n\nDo you have any suggestions or comments for us? 💡🚀👨🏽‍🎓",
 uLikeNext: "What would you like to do next?",
 moreBot: "Here are some more fun bots for you to explore! ",
 sure:"Yes, I want to share.",
 NMMS1: "What is NMMS?",
 checkState: "Check for another State/UT ",
 userfeedback:"Kindly express your thoughts and opinions by typing them in the provided text box and pressing the 'send' button.📖",
 yearSelectionPrompt:"Please select a year to get the question paper",
 ST21Message:"Great! Which year's question papers are you interested in?📅🔍",
 thankyou:"🙏Thank you for taking the time to share your feedback with me😊",
 changeState:"Change State",
 applySchloarship:"Apply For Scholarship",



  async States(redisService) {
    const cacheKey = 'updated_states_cache'; // Unique key for caching states
    let sheetAPI = process.env.Sheet_API;

    try {
      // Check Redis cache for states data
      const cachedStates = await redisService.get(cacheKey);
      if (cachedStates) {
        console.log('Fetching states from cache.');
        console.log(JSON.parse(cachedStates).sort((a, b) => a.localeCompare(b)))
        return JSON.parse(cachedStates).sort((a, b) => a.localeCompare(b));
      } else {
        // Fetch states from the API only if not in cache
        console.log('Fetching states from API.');
        const response = await axios.get(sheetAPI, {
          params: { action: 'getStates' },
        });

        if (response.data) {
          // Cache the states data in Redis with a TTL (e.g., 1 hour)
          const sortedStates = response.data.sort((a, b) => a.localeCompare(b));
          await redisService.set(cacheKey, JSON.stringify(sortedStates)); // TTL = 1 hour
          return sortedStates;
        }
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error; // Optionally rethrow to handle upstream
    }
  }

// old
  // async States() {
  //   const response = await axios.get(
  //       'https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec',
  //       { params: { action: 'getStates' } }
  //   );
  //   console.log(response.data); 
  //   if (response.data) {
  //       return response.data;}
  //     }


}

