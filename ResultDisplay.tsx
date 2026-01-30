
import React, { useState, useRef, useEffect } from 'react';
// Fix: Reading is now available in types.ts
import { Reading, DivinationType } from '../types';
import Card from './Card';
import { generateSpeech } from '../services/geminiService';
import { useAppContext } from '../App';

// Audio decoding functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const getTitlesForType = (type: DivinationType | null) => {
    // Fix: DivinationType expanded with missing members
    if (type === DivinationType.PILGRIMAGE) {
        return { main: 'Details', past: 'History & Significance', present: 'Current Form & Story', future: 'Spiritual Guidance', icons: ['📜', '🏛️', '🕊️'] };
    }
    if (type === DivinationType.SKILL_LEARNING) {
        return { main: 'Skill Roadmap', past: 'Prerequisites', present: 'Learning Path', future: 'Career Scope', icons: ['🎓', '🛣️', '🚀'] };
    }
    if (type === DivinationType.BUSINESS_MOTIVATION) {
        return { main: 'Motivational Story', past: 'The Struggle', present: 'The Turning Point', future: 'The Success', icons: ['📉', '⚡', '🏆'] };
    }
    if (type === DivinationType.AUDIO_STORY) {
        return { main: 'Audio Story', past: 'Beginning', present: 'Middle', future: 'Ending', icons: ['📖', '🔥', '🏁'] };
    }
    if (type === DivinationType.ZODIAC) {
        return { main: 'Zodiac Reading', past: 'Nature & Personality', present: 'Positive Traits & Strengths', future: 'Challenges & Areas for Growth', icons: ['👤', '✨', '💪'] };
    }
    if (type === DivinationType.DAILY_HOROSCOPE) {
        return { main: 'Daily Horoscope', past: 'Theme of the Day', present: 'Detailed Horoscope', future: 'Advice for the Day', icons: ['☀️', '🔍', '💡'] };
    }
    if (type === DivinationType.HOROSCOPE) {
        return { main: 'Horoscope', past: 'Overview & Main Theme', present: 'Detailed Horoscope', future: 'Advice & Remedies', icons: ['📅', '🔍', '💡'] };
    }
    if (type === DivinationType.DAILY_FORTUNE_CARD) {
        return { main: 'Fortune Card', past: 'Theme of the Day', present: 'Fortune for Today', future: 'Mantra for the Day', icons: ['🌟', '🥠', '🧘'] };
    }
    if (type === DivinationType.DREAM) {
        return { main: 'Dream Interpretation', past: 'Symbolism of the Dream', present: 'Connection to Current Life', future: 'Guidance for the Future', icons: ['📖', '🧘', '🧭'] };
    }
    if (type === DivinationType.TRAVEL) {
        return { main: 'Travel Forecast', past: 'Pre-Journey Thoughts', present: 'During the Journey', future: 'Outcome of the Journey', icons: ['🎒', '✈️', '✅'] };
    }
     if (type === DivinationType.TRAIN_JOURNEY) {
        return { main: 'Train Journey Details', past: 'Route Information', present: 'List of Trains', future: 'Travel Tips & Ticket Price', icons: ['📜', '🚂', '💰'] };
    }
    if (type === DivinationType.MOLE) {
        return { main: 'Mole Astrology', past: 'General Meaning of the Mole', present: 'Benefits (Fayde)', future: 'Harms (Nuksan)', icons: ['📖', '✅', '❌'] };
    }
    if (type === DivinationType.LOVE_RELATIONSHIP) {
        return { main: 'Love Relationship Analysis', past: 'Past of the Relationship', present: 'Current Situation', future: 'Future Possibilities', icons: ['🌱', '💖', '✨'] };
    }
    if (type === DivinationType.MARRIAGE_COMPATIBILITY) {
        return { main: 'Marriage Compatibility Report', past: 'Core Compatibility & Guna Milan', present: 'Strengths & Weaknesses of the Union', future: 'Future & Remedies', icons: ['📜', '💑', '✨'] };
    }
    if (type === DivinationType.LOVE_COMPATIBILITY) {
        return { main: 'Love Compatibility Report', past: 'Basis of Attraction', present: 'Current Relationship', future: 'Future Potential', icons: ['💕', '📊', '💖'] };
    }
     if (type === DivinationType.TAROT) {
        return { main: 'Reading', past: 'Your Past', present: 'Your Present', future: 'Your Future', icons: ['📜', '🔮', '✨'] };
    }
    if (type === DivinationType.JANAM_KUNDLI) {
        return { main: 'Kundli Analysis', past: 'Personality & Planetary Positions', present: 'Current Dasha & Effects', future: 'Predictions & Remedies', icons: ['👤', '⏳', '✨'] };
    }
    if (type === DivinationType.SEASONAL_FOOD) {
        return { main: 'Food Guide', past: 'What to Eat', present: 'What to Avoid', future: 'General Health Tips', icons: ['🥗', '🚫', '❤️'] };
    }
    if (type === DivinationType.ANG_SPHURAN) {
        return { main: 'Body Twitching Results', past: 'General Meaning (Male-Female)', present: 'Auspicious Results', future: 'Inauspicious Results', icons: ['📖', '👍', '👎'] };
    }
    if (type === DivinationType.SNEEZING) {
        return { main: 'Sneeze Interpretation', past: 'General Meaning of Sneeze', present: 'Beneficial Results', future: 'Harmful Results', icons: ['🤧', '✅', '❌'] };
    }
    if (type === DivinationType.BUSINESS_ASTROLOGY) {
        return { main: 'Business Astrology Analysis', past: 'Your Business Potential', present: 'Suitable Business Sectors', future: 'Tips for Success', icons: ['👤', '💼', '💡'] };
    }
    if (type === DivinationType.FOOD_COMBINATION) {
        return { main: 'Food Combination Analysis', past: 'What to Eat Together', present: 'What Not to Eat Together', future: 'General Health Tips', icons: ['✅', '❌', '❤️'] };
    }
    if (type === DivinationType.RELIGIOUS_RITUALS) {
        return { main: 'Religious Information', past: 'History & Significance', present: 'Method / Text', future: 'Benefits & Spiritual Gain', icons: ['📜', '📖', '✨'] };
    }
    if (type === DivinationType.PRASHNA_PARIKSHA) {
        return { main: 'Analysis', past: 'Context of the Past', present: 'Current Situation', future: 'Indication for the Future', icons: ['📜', '🤔', '✨'] };
    }
    if (type === DivinationType.PRASHNA_CHAKRA) {
        return { main: 'Answer', past: 'Your Question', present: "The Chakra's Answer", future: 'Guidance', icons: ['❓', '☸️', '💡'] };
    }
    if (type === DivinationType.FAMOUS_PLACE_TRAVEL) {
        return { main: 'Travel Information', past: 'History & Significance of the Place', present: 'Travel Information', future: 'Tips & Advice', icons: ['📜', '🗺️', '💡'] };
    }
    if (type === DivinationType.ENGLISH_GURU) {
        return { main: 'Analysis', past: 'English Translation', present: 'Grammar Explanation', future: 'Vocabulary and Tips', icons: ['🇬🇧', '📖', '💡'] };
    }
    if (type === DivinationType.SCAN_TRANSLATE) {
        return { main: 'Translation Result', past: 'Original Text', present: 'Translated Text', future: 'Notes', icons: ['📝', '🌐', '💡'] };
    }
    if (type === DivinationType.TEXT_TO_IMAGE) {
        return { main: 'Image', past: 'Description', present: 'Your Prompt', future: 'Next Steps', icons: ['🖼️', '✍️', '💡'] };
    }
    if (type === DivinationType.STORY_TO_VIDEO) {
        return { main: 'Story Video', past: 'Your Script', present: 'Generated Video', future: 'Next Steps', icons: ['📜', '🎬', '💡'] };
    }
    if (type === DivinationType.IMAGE_TO_VIDEO) {
        return { main: 'Video', past: 'Your Original Image', present: 'Generated Video', future: 'Next Steps', icons: ['🖼️', '🎬', '💡'] };
    }
    if (type === DivinationType.VASTU_SHASTRA) {
        return { main: 'Vastu Analysis', past: 'Vastu Principles', present: 'Analysis of Your Situation', future: 'Suggestions & Remedies', icons: ['📜', '🏡', '💡'] };
    }
    if (type === DivinationType.AI_FACE_READING) {
        return { main: 'Face Analysis', past: 'Personality & Nature', present: 'Strengths & Weaknesses', future: 'Potential & Guidance', icons: ['👤', '💪', '💡'] };
    }
    if (type === DivinationType.AI_TIME_MACHINE) {
        return { main: 'Time Machine', past: 'Based on your current image', present: 'Your future in 10 years', future: 'Guidance', icons: ['👤', '⏳', '💡'] };
    }
    if (type === DivinationType.AI_FUTURE_GENERATOR) {
        return { main: 'Prediction', past: 'Origin of the Question', present: 'Current Energies', future: 'Guidance for the Future', icons: ['❓', '⚡', '🌟'] };
    }
    return { main: 'Reading', past: 'Your Past', present: 'Your Present', future: 'Your Future', icons: ['📜', '🔮', '✨'] };
};

const ResultSection: React.FC<{ title: string; content: string; icon: string }> = ({ title, content, icon }) => (
    <div className="mb-6 last:mb-0 text-left">
        <h3 className="flex items-center gap-3 text-xl font-hindi font-bold text-purple-300 mb-2">
            <span className="text-2xl">{icon}</span>
            {title}
        </h3>
        <p className="text-lg text-white/90 leading-relaxed font-hindi bg-white/5 p-4 rounded-xl border border-white/10">{content}</p>
    </div>
);

const ResultDisplay: React.FC<{ reading: Reading | null; divinationType: DivinationType; onReset: () => void; onSave: () => void; isSaved: boolean }> = ({ reading, divinationType, onReset, onSave, isSaved }) => {
    const { t } = useAppContext();
    const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const titles = getTitlesForType(divinationType);

    useEffect(() => {
        return () => {
            if (audioSourceRef.current) audioSourceRef.current.stop();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    if (!reading) return null;

    const handleSpeak = async () => {
        if (isSpeaking && audioSourceRef.current) {
            audioSourceRef.current.stop();
            setIsSpeaking(false);
            return;
        }

        if (isGeneratingSpeech) return;

        setIsGeneratingSpeech(true);
        try {
            const textToSpeak = `${titles.past}. ${reading.past}. ${titles.present}. ${reading.present}. ${titles.future}. ${reading.future}.`;
            const base64Audio = await generateSpeech(textToSpeak.substring(0, 1000)); // Limit for TTS
            
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
                setIsSpeaking(false);
                audioSourceRef.current = null;
            };

            source.start();
            audioSourceRef.current = source;
            setIsSpeaking(true);

        } catch (err) {
            console.error("Audio playback error:", err);
            alert("ऑडियो चलाने में त्रुटि हुई।");
        } finally {
            setIsGeneratingSpeech(false);
        }
    };

    return (
        <Card className="animate-fade-in max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onReset} className="text-purple-300 hover:text-white transition">&larr; वापस</button>
                <button
                    onClick={handleSpeak}
                    disabled={isGeneratingSpeech}
                    className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                >
                    {isGeneratingSpeech ? (
                         <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    ) : isSpeaking ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                    )}
                </button>
            </div>

            <h2 className="text-3xl font-hindi font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
                {titles.main}
            </h2>

            <div className="space-y-6 mb-8">
                {reading.past && <ResultSection title={titles.past} content={reading.past} icon={titles.icons[0]} />}
                {reading.present && <ResultSection title={titles.present} content={reading.present} icon={titles.icons[1]} />}
                {reading.future && <ResultSection title={titles.future} content={reading.future} icon={titles.icons[2]} />}
                
                {!reading.past && !reading.present && !reading.future && (
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                        <p className="text-xl text-white/90 leading-relaxed whitespace-pre-wrap font-hindi">
                            {reading.result}
                        </p>
                    </div>
                )}
            </div>
            
            <div className="text-center flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={onSave}
                    className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                        isSaved ? 'bg-green-600 text-white shadow-lg' : 'bg-white/10 text-purple-200 border border-white/20 hover:bg-white/20'
                    }`}
                    disabled={isSaved}
                >
                    {isSaved ? 'सहेजा गया!' : 'सहेजें'}
                </button>
                <button
                    onClick={onReset}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    नई खोज करें
                </button>
            </div>
        </Card>
    );
};

export default ResultDisplay;
