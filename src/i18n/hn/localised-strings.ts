import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
export const localisedStrings = {
  welcomeMessage: `👋 नमस्ते! मैं आपको NMMS छात्रवृत्ति के बारे में बताने के लिए यहाँ हूँ! 🌟\n\n🎓 राष्ट्रीय आर्थिक रूप से कमजोर वर्ग मेरिट छात्रवृत्ति (NMMS) कक्षा 8 के उन होनहार छात्रों के लिए है, जिन्हें अपनी शिक्षा जारी रखने के लिए सहायता की आवश्यकता है।\n\n📚 यदि आप योग्य हैं, तो आपको कक्षा 12 तक पढ़ाई के लिए हर साल ₹12,000 मिल सकते हैं!\n\nकृपया शुरू करने के लिए अपनी भाषा चुनें।`,
  languageChangedMessage: '🎉 *शानदार! आपने हिंदी चुनी है। चलिए शुरू करते हैं!* 🎓\n\n🌟 *NMMS क्या है?*\nNMMS छात्रवृत्ति कक्षा *8 के छात्रों* के लिए एक कार्यक्रम है जो उनकी शिक्षा में सहायता करता है। यदि आप योग्य हैं, तो आपको कक्षा 12 तक *हर साल ₹12,000* (₹1,000 प्रति माह) मिलेंगे!',
  languageSelection:"शुरू करने के लिए कृपया अपनी भाषा चुनें!",
  languageEnglish: 'English',
  languageHindi: 'हिन्दी',
  userLanguage: 'hindi',
  whoCanApplyPrompt:"अधिक जानने के लिए नीचे दिए गए बटन पर क्लिक करें:",
  whoCanApply:"🎯कौन आवेदन कर सकता है",
  getWhoCanApplyStrings: "1️⃣ आपको सरकारी, सरकारी सहायता प्राप्त या स्थानीय निकाय स्कूल में *कक्षा 8* में होना चाहिए।\n 2️⃣ आपको *कक्षा 7 में कम से कम 55% अंक* (अनुसूचित जाति/अनुसूचित जनजाति के छात्रों के लिए 50%) प्राप्त होने चाहिए।\n 3️⃣ आपके परिवार की *कुल आय ₹3.5 पैर प्रति वर्ष से कम* होनी चाहिए।",
  next:"अगला",
  howCanSelected:'📝 मेरा चयन कैसे हो सकता है?',
  yearSelectionPrompt:"प्रश्न पत्र प्राप्त करने के लिए कृपया एक वर्ष चुनें",
  selectedMessage:'आपको एक परीक्षा देनी होगी. परीक्षा में दो खंड हैं:\n *• मानसिक योग्यता परीक्षण (MAT):* समस्या-समाधान और तार्किक सोच का परीक्षण करने के लिए। \n *• स्कोलास्टिक एबिलिटी टेस्ट (SAT):* आपके स्कूल के विषयों जैसे विज्ञान, गणित और सामाजिक अध्ययन पर आधारित प्रश्न।',
  stateSelectionMessage:'आप किस राज्य के लिए उपलब्ध जानकारी देखना चाहते हैं?',
  like:'अब आप क्या करना चाहेंगे',
  applyNow: 'अभी अप्लाई करें',
  viewWebsite: 'वेबसाइट देखें',
  ST21Message:"शानदार! आपको किस वर्ष के प्रश्न पत्रों में रुचि है?📅🔍",
  seeQuestionPaper:'प्रश्न पत्र देखें',
  buttonPrompt: "एक विकल्प चुनें",
  sureNextButton: "कृपया वेबसाइट देखने के लिए नीचे दिए गए बटन पर क्लिक करें।",
  // Next: "अगला⏭️",
  Next : (previousButton) =>   `${previousButton}`,
  feedback: "हम इस बॉट को और बेहतर बनाने के लिए आपका फ़ीडबैक सुनना चाहेंगे 🔍\n\nक्या आपके पास हमारे लिए कोई सुझाव या टिप्पणी है? 💡🚀👨🏽‍🎓",
  uLikeNext: "आप आगे क्या करना चाहेंगे?",
  afterQuestionPaper:"और मैं आपकी किस तरह मदद कर सकता हूँ?",
  moreBot: "यहां कुछ और मजेदार बॉट्स हैं जिन्हें आप एक्सप्लोर कर सकते हैं!",
  sure: "हाँ, मैं साझा करना चाहता हूँ।",
 NMMS1:  "NMMS क्या है?",
 checkState: "किसी और राज्य की जांच करें", 
 userfeedback:"कृपया अपने विचार और राय प्रदान किए गए टेक्स्ट बॉक्स में टाइप करें और 'भेजें' बटन दबाकर उन्हें भेजें।📖",
 thankyou:"🙏आपने अपना सुझाव साझा करने के लिए समय निकाला, इसके लिए धन्यवाद।😊",
 changeState:"राज्य बदलें",
 applySchloarship:"छात्रवृत्ति के लिए आवेदन करें",


    async States(redisService) {
      const cacheKey = 'updated_states_cache'; // Unique key for caching states
      let sheetAPI = process.env.Sheet_API;

      try {
        // Check Redis cache for states data
        const cachedStates = await redisService.get(cacheKey);
        if (cachedStates) {
          console.log('Fetching states from cache.');
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

  // async States() {
  
  // const response = await axios.get(
  //     'https://script.google.com/macros/s/AKfycbzadxZh0c3UZp83cJZIBv-W9q30x5g6SJE2oOgYjXn1A-Sl1Y1MCejaZ7_hVcmiKf9ytw/exec',
  //     { params: { action: 'getStates' } }
  // );
  // console.log(response.data); 
  // if (response.data) {
  //     return response.data;}
  //   }



 ,
 stateNotFound: "क्षमा करें! चयनित राज्य के लिए छात्रवृत्ति जानकारी फिलहाल उपलब्ध नहीं है।\nकृपया बताएं, आप आगे क्या करना चाहेंगे?",
 
 chooseAnotherState:"दूसरा राज्य चुनें",


};
