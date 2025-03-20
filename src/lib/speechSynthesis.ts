interface SpeechOptions {
    voice?: SpeechSynthesisVoice;
    pitch?: number;
    rate?: number;
    volume?: number;
}

export function getAvailableVoices(language?: string): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return [];
    }

    const voices = window.speechSynthesis.getVoices();
    
    if (!language) {
        return voices;
    }
    
    // Filter voices by language code (e.g., 'en', 'fr')
    return voices.filter(voice => voice.lang.startsWith(language));
}

export function speakText(
    text: string, 
    language: string, 
    options: SpeechOptions = {},
    onEnd?: () => void
): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = language;
    
    // Apply options
    if (options.pitch !== undefined) utterance.pitch = options.pitch;
    if (options.rate !== undefined) utterance.rate = options.rate;
    if (options.volume !== undefined) utterance.volume = options.volume;

    // Set callback
    if (onEnd) {
        utterance.onend = onEnd;
    }

    // Function to speak once voices are available
    const speakWithVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = options.voice || voices.find(voice => voice.lang.toLowerCase().includes(language.toLowerCase()));

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
            console.warn(`No voice found for language: ${language}, using default.`);
        }

        window.speechSynthesis.speak(utterance);
    };

    // Ensure voices are loaded before speaking
    if (window.speechSynthesis.getVoices().length > 0) {
        speakWithVoice();
    } else {
        console.warn("Voices not loaded yet, waiting...");
        window.speechSynthesis.onvoiceschanged = () => {
            speakWithVoice();
        };
    }
}

export function stopSpeaking(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
    }
    
    window.speechSynthesis.cancel();
}
