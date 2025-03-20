interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechGrammarList: new () => SpeechGrammarList;
    webkitSpeechGrammarList: new () => SpeechGrammarList;
    SpeechRecognitionEvent: Event;
    webkitSpeechRecognitionEvent: Event;
  }