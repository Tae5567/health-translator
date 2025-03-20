//Service file for translation
import { translateMedicalInput } from './openai';
import { speakText as speakTextWithSynthesis, stopSpeaking } from './speechSynthesis';

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  setTranslation: (text: string) => void,
  setStatus: (status: 'idle' | 'translating' | 'completed' | 'error') => void
): Promise<void> {
  // Don't translate if there's no text or languages are the same
  if (!text.trim() || sourceLanguage === targetLanguage) {
    setTranslation(text);
    setStatus('completed');
    return;
  }

  try {
    setStatus('translating');
    
    // Get language names from codes
    const sourceLangName = getLanguageName(sourceLanguage);
    const targetLangName = getLanguageName(targetLanguage);
    
    // Translate the text
    const translatedText = await translateMedicalInput(
      text,
      sourceLangName,
      targetLangName
    );
    
    setTranslation(translatedText);
    setStatus('completed');
  } catch (error) {
    console.error('Translation error:', error);
    setStatus('error');
  }
}

// Helper function to convert language codes to full names
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en-US': 'English',
    'fr-FR': 'French',
    'es-ES': 'Spanish',
    'nl-NL': 'Dutch',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'pt-PT': 'Portuguese',
    'ar-SA': 'Arabic',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
  };

  return languages[code] || code;
}

// Function to speak the translated text - use the implementation from speechSynthesis.ts
export function speakText(text: string, language: string): void {
  speakTextWithSynthesis(text, language);
}

// Export stopSpeaking from speechSynthesis to avoid duplicate function
export { stopSpeaking };