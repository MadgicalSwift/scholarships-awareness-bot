import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
export const localisedStrings = {
  welcomeMessage: `👋 नमस्ते! मैं आपको एनएमएमएस छात्रवृत्ति के बारे में बताता हूँ! 🌟 \n\n\n🎓नेशनल मीन्स-कैम-मेरिट स्कॉलरशिप (एनएमएमएस) कक्षा 8 के उन छात्रों के लिए है जो मेधावी हैं लेकिन उन्हें अपनी शिक्षा जारी रखने के लिए कुछ मदद की ज़रूरत है। \n\n\n📚 यदि आप अर्हता प्राप्त करते हैं, तो आपको 12वीं कक्षा तक की पढ़ाई के लिए प्रति वर्ष 12,000 मिल सकते हैं। \n\n\n\nआरंभ करने के लिए कृपया अपनी भाषा चुनें!`,
  languageChangedMessage: '🎉 **बढ़िया! आपने हिन्दी चुनी है. आएँ शुरू करें!** यहां वह सब कुछ है जो आपको **नेशनल मीन्स-कम-मेरिट स्कॉलरशिप (एनएमएमएस) के बारे में जानने की जरूरत है: 🌟एनएमएमएस क्या है?** एनएमएमएस छात्रवृत्ति कक्षा 8 के छात्रों के लिए उनकी शिक्षा का समर्थन करने के लिए एक कार्यक्रम है। यदि आप अर्हता प्राप्त करते हैं, तो आपको कक्षा 12 तक **प्रति वर्ष ₹ 12,000** (₹ 1000 प्रति माह) प्राप्त होंगे!',
  languageEnglish: 'English',
  languageHindi: 'हिन्दी',
  userLanguage: 'hindi',
  whoCanApplyPrompt:"अधिक जानने के लिए नीचे दिए गए बटन पर क्लिक करें:",
  whoCanApply:"🎯कौन आवेदन कर सकता है",
  getWhoCanApplyStrings: "1️⃣ आपको सरकारी, सरकारी सहायता प्राप्त या स्थानीय निकाय स्कूल में *कक्षा 8* में होना चाहिए।\n\n 2️⃣ आपको **कक्षा 7 में कम से कम 55% अंक** (अनुसूचित जाति/अनुसूचित जनजाति के छात्रों के लिए 50%) प्राप्त होने चाहिए।\n\n 3️⃣ आपके परिवार की **कुल आय ₹3.5 पैर प्रति वर्ष से कम** होनी चाहिए।",
  next:"अगला",
  howCanSelected:'📝 मेरा चयन कैसे हो सकता है?',
  yearSelectionPrompt:"प्रश्न पत्र प्राप्त करने के लिए कृपया एक वर्ष चुनें",
  selectedMessage:'आपको एक परीक्षा देनी होगी. परीक्षा में दो खंड हैं:\n **1.मानसिक योग्यता परीक्षण (MAT):** समस्या-समाधान और तार्किक सोच का परीक्षण करने के लिए। \n **2.स्कोलास्टिक एबिलिटी टेस्ट (SAT):** आपके स्कूल के विषयों जैसे विज्ञान, गणित और सामाजिक अध्ययन पर आधारित प्रश्न।',
  stateSelectionMessage:'आप किस राज्य के लिए उपलब्ध जानकारी देखना चाहते हैं?',
  like:'अब आप क्या करना चाहेंगे',
  applyNow: 'अभी अप्लाई करें',
  seeMore: 'और देखें',
  ST21Message:"📅 बढ़िया! आपकी रुचि किस वर्ष के प्रश्नपत्रों में है? मुझे बताएं और मैं आपको उस वर्ष के लिए प्रासंगिक कागजात प्रदान करूंगा!📝 🔍",
  seeQuestionPaper:'प्रश्न पत्र देखें',
  buttonPrompt: "एक विकल्प चुनें",
  sureNextButton: "ज़रूर, जारी रखने के लिए कृपया 'अगला' पर क्लिक करें",
  Next: "अगला⏭️",
  feedback: "मुझे कोई भी प्रतिक्रिया सुनकर खुशी होगी, जिससे हम इसे और बेहतर बना सकें🔎 \n\nक्या आपके पास कोई विचार या टिप्पणियाँ हैं, जो आप साझा करना चाहेंगे?💡🚀🎓",
  uLikeNext: "आप आगे क्या करना चाहेंगे?",
  moreBot: "यहां कुछ और मजेदार बॉट्स हैं जिन्हें आप एक्सप्लोर कर सकते हैं!",
  sure: "बिलकुल! मुझे साझा करना बहुत पसंद है",
 NMMS1:  "NMMS क्या है?",
 checkState: "किसी और राज्य की जांच करें", 
 userfeedback:"कृपया अपने विचार और राय प्रदान किए गए टेक्स्ट बॉक्स में टाइप करें और 'भेजें' बटन दबाकर उन्हें भेजें।📖",
 thankyou:"🙏आपने अपना सुझाव साझा करने के लिए समय निकाला, इसके लिए धन्यवाद।😊",

 async States() {
  const cacheKey = 'states_cache'; // Unique key for caching states
  let sheetAPI = process.env.Sheet_API;

  try {
    // Check Redis cache for states data
    const cachedStates = await this.redisService.get(cacheKey);
    if (cachedStates) {
      console.log('Fetching states from cache.');
      return JSON.parse(cachedStates);
    } else {
      // Fetch states from the API only if not in cache
      console.log('Fetching states from API.');
      const response = await axios.get(sheetAPI, {
        params: { action: 'getStates' },
      });

      if (response.data) {
        // Cache the states data in Redis with a TTL (e.g., 1 hour)
        await this.redisService.set(cacheKey, JSON.stringify(response.data), 'EX', 3600); // TTL = 1 hour
        return response.data;
      }
    }
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error; // Optionally rethrow to handle upstream
  }
}


};
