//Languages available to be translated

export interface Language {
    code: string;
    name: string;
    voiceName?: string; //For text-to-speech
}

//Available laguages for translation
export const LANGUAGES: Language[] = [
    {code: 'en-US', name: 'English'},
    {code: 'fr-FR', name: 'French'},
    //{code: 'yo', name: 'Yoruba'}, Web Speech API does not support Yoruba
    //{code: 'ig', name: 'Igbo'}, 
    {code: 'es-ES', name: 'Spanish'},
    {code: 'nl-NL', name: 'Dutch'},
    {code: 'it-IT', name: 'Italian'},
    {code: 'ja-JP', name: 'Japanese'},
    {code: 'ko-KR', name: 'Korean'},
    {code: 'pt-PT', name: 'Portuguese'},
    //{code: 'ha', name: 'Hausa'}, 
    {code: 'ar-SA', name: 'Arabic'},
    {code: 'zh-CN', name: 'Chinese'},
];

//Transcription status
export type TranscriptionStatus = 'idle'| 'recording' | 'processing' | 'completed' | 'error';

//Translation status
export type TranslationStatus = 'idle' | 'translating' | 'completed' | 'error';