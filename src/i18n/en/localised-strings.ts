import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
export const localisedStrings = {
  welcomeMessage: '👋 Hi there! Let me tell you about the NMMS Scholarship! \n\n🌟🎓The National Means-cam-Merit Scholarship (NMMS) is for students in Class 8 who are bright but need some help to continue their education.\n\n\n 📚 If you qualify, you can get  12,000  a year for studies until Class 12.\n\n Please choose your language to get started!',
  seeMoreMessage: 'See More Data',
  languageHindi: 'हिन्दी',
  languageEnglish: 'English',
  userLanguage:'english',
  languageChangedMessage: "*🎉Great! You’ve selected English. Let's get started!* \n\nHere's everything you need to know about the *National Means-cum-Merit Scholarship (NMMS):🌟What is NMMS?* The NMMS Scholarship is a program for Class 8 students to support their education. \n\nIf you qualify, you’ll receive *₹ 12,000 per year* ( ₹ 1000 per month ) until Class 12!",
  languageSelection: '🔍Please select your 🗺️language.',
  whoCanApplyPrompt:"Please click the button below to learn more:",
  whoCanApply:"🎯Who Can Apply",
  getWhoCanApplyStrings: "1️⃣ You must be in *Class 8* at a government, government-aided or local body school.\n\n 2️⃣You should have scored at least *55% marks in Class 7* ( 50% for SC/ST students ).\n\n 3️⃣ Your family’s total income should be *less than ₹3.5 Lakhs per year.*",
  next: "Next",
  howCanSelected:'📝 How can I get selected?',
  selectedMessage:'You will need to take an exam. The exam has two sections:\n *1. Mental Ability Test(MAT):* To test problem-solving and logical thinking. \n *2. Scholastic Ability Test (SAT):* Questions based on your school subjects like Science, Maths and Social Studies.',
  stateSelectionMessage: 'For which state do you want to see the information available?',
  like:'What would you like to do next',
  applyNow: 'Apply Now',
  seeMore: 'See More',
 seeQuestionPaper: 'See Question Papers',
 sureNextButton: "Sure, please click on 'Next' to continue",
 buttonPrompt:"Choose an option:",
 Next: "Next⏭️",
 feedback: "I'd love to hear any feedback you may have to make our this better🔎 \n\nDo you have any thoughts or comments you'd like to share?💡🚀🎓",
 uLikeNext: "what would you like to do next?",
 moreBot: "Here are some more fun bots for you to explore! ",
 sure:"Sure! I love to Share",
 NMMS1: "What is NMMS?",
 checkState: "Check for another State",
 userfeedback:"Kindly express your thoughts and opinions by typing them in the provided text box and pressing the 'send' button.📖",
 yearSelectionPrompt:"Please select a year to get the question paper",
 ST21Message:"📅 Great! Which year's question papers are you interested in? Let me know and I'll provide you with the relevant papers for that year!📝  🔍",
 thankyou:"🙏Thank you for taking the time to share your feedback with me😊",
 
    async States() {
      let sheetAPI = process.env.Sheet_API
            const response = await axios.get(
                sheetAPI,
                { params: { action: 'getStates' } }
            );
          
            if (response.data) {
                return response.data;}
    }



// async States(redisService) {
//   const cacheKey = 'states_cache'; // Unique key for caching states
//   let sheetAPI = process.env.Sheet_API;

//   try {
//     // Check Redis cache for states data
//     const cachedStates = await redisService.get(cacheKey);
//     if (cachedStates) {
//       console.log('Fetching states from cache.');
//       console.log(JSON.parse(cachedStates).sort((a, b) => a.localeCompare(b)))
//       return JSON.parse(cachedStates).sort((a, b) => a.localeCompare(b));
//     } else {
//       // Fetch states from the API only if not in cache
//       console.log('Fetching states from API.');
//       const response = await axios.get(sheetAPI, {
//         params: { action: 'getStates' },
//       });

//       if (response.data) {
//         // Cache the states data in Redis with a TTL (e.g., 1 hour)
//         const sortedStates = response.data.sort((a, b) => a.localeCompare(b));
//         await redisService.set(cacheKey, JSON.stringify(sortedStates)); // TTL = 1 hour
//         return sortedStates;
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching states:', error);
//     throw error; // Optionally rethrow to handle upstream
//   }
// }

}

