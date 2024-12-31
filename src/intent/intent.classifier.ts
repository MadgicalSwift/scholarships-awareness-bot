import * as natural from 'natural';
import { localisedStrings } from 'src/i18n/en/localised-strings';

class IntentClassifier {
  private classifier: natural.BayesClassifier;
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }
  private trainClassifier() {
    this.classifier.addDocument('Hi', 'greeting');
    this.classifier.addDocument("Kindly express your thoughts and opinions by typing them in the provided text box and pressing the 'send' button.📖", "कृपया अपने विचार और राय प्रदान किए गए टेक्स्ट बॉक्स में टाइप करें और 'भेजें' बटन दबाकर उन्हें भेजें।📖");
    
        this.classifier.train();
  }

  private getEntities(intent: string, message: string): string[] {
    if (intent === 'greeting') {
      if (localisedStrings.languageHindi.indexOf(message)) {
        return ['hindi'];
      } else {
        return ['english'];
      }
    }
  }
  public getIntent(message: string): { intent: string; entities: string[] } {
    const intent = this.classifier.classify(message);
    const entities = this.getEntities(intent, message);
    return {
      intent: intent,
      entities: entities,
    };
  }
}
export default IntentClassifier;