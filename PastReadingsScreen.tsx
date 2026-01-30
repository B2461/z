
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
// Fix: SavedReading is now available in types.ts
import { SavedReading, DivinationType } from '../types';
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
    const defaultTitles = { main: 'Reading', past: 'Past Analysis', present: 'Present Situation', future: 'Future Prediction', icons: ['📜', '🔮', '✨'] };
    if (!type) return defaultTitles;
    // Fix: DivinationType now contains missing members
    if (type === DivinationType.JANAM_KUNDLI) return { main: 'Kundli Analysis', past: 'Personality & Roots', present: 'Current Dasha', future: 'Predictions', icons: ['👤', '⏳', '✨'] };
    if (type === DivinationType.TAROT) return { main: 'Tarot Reading', past: 'Past Influences', present: 'Current Situation', future: 'Outcome', icons: ['🃏', '⚡', '🔮'] };
    if (type === DivinationType.LOVE_COMPATIBILITY) return { main: 'Love Report', past: 'Connection Basis', present: 'Relationship Status', future: 'Future Potential', icons: ['💕', '💞', '💍'] };
    if (type === DivinationType.AI_FUTURE_GENERATOR) return { main: 'AI Prediction', past: 'Origin', present: 'Current Energy', future: 'Forecast', icons: ['🤖', '📊', '🚀'] };
    return defaultTitles;
};

const ResultSection: React.FC<{ title: string; content: string; icon: string; }> = ({ title, content, icon }) => (
    <div className="mb-6">
        <h3 className="flex items-center gap-3 text-xl font-hindi font-bold text-purple-300 mb-2">
            <span className="text-2xl">{icon}</span>
            {title}
        </h3>
        <p className="text-lg text-white/90 whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
);

const PastReadingDetail: React.FC<{ savedReading: SavedReading, onDelete: (id: string) => void, onBack: () => void }> = ({ savedReading, onDelete, onBack }) => {
    const { reading, divinationType, id } = savedReading;
    const titles = getTitlesForType(divinationType);
    const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const handleDelete = () => {
        if (confirm("चेतावनी: क्या आप इसे हटाना चाहते हैं?\n\nयह डेटा आपके क्लाउड अकाउंट से स्थायी रूप से हटा दिया जाएगा।")) {
            onDelete(id);
            onBack();
        }
    };

    const handleSpeak = async () => {
         if (isSpeaking && audioSourceRef.current) { audioSourceRef.current.stop(); setIsSpeaking(false); return; }
         setIsGeneratingSpeech(true);
         try {
             const text = `${titles.past}. ${reading.past}. ${titles.present}. ${reading.present}. ${titles.future}. ${reading.future}`;
             const audioBase64 = await generateSpeech(text.substring(0, 500)); 
             const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
             const buffer = await decodeAudioData(decode(audioBase64), ctx);
             const source = ctx.createBufferSource();
             source.buffer = buffer;
             source.connect(ctx.destination);
             source.onended = () => setIsSpeaking(false);
             source.start();
             audioContextRef.current = ctx;
             audioSourceRef.current = source;
             setIsSpeaking(true);
         } catch(e) { console.error(e); alert("Audio Error"); }
         finally { setIsGeneratingSpeech(false); }
    };

    return (
        <Card className="max-w-4xl mx-auto w-full animate-slide-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-purple-300 hover:text-white transition flex items-center gap-1">
                    &larr; वापस
                </button>
                <div className="flex gap-3">
                    <button onClick={handleDelete} className="text-red-400 hover:text-red-200 text-sm font-bold border border-red-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                        🗑️ Delete
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-3xl font-hindi font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    {divinationType}
                </h2>
                <button onClick={handleSpeak} disabled={isGeneratingSpeech} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 hover:bg-white/20">
                    {isSpeaking ? '⏹️' : '🔊'}
                </button>
            </div>
            
            <div className="text-center mb-8">
                <p className="text-gray-400 text-xs">Saved on: {new Date(savedReading.date).toLocaleString('hi-IN')}</p>
                <span className="inline-block bg-green-900/40 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-500/30 mt-1">☁️ Securely Saved in Cloud</span>
            </div>

            {reading.imageUrl && (
                <img src={reading.imageUrl} alt="Result" className="w-full max-w-sm mx-auto rounded-lg mb-6 border border-white/10" />
            )}

            <div className="space-y-6">
                <ResultSection title={titles.past} content={reading.past} icon={titles.icons[0]} />
                <div className="border-t border-white/10"></div>
                <ResultSection title={titles.present} content={reading.present} icon={titles.icons[1]} />
                <div className="border-t border-white/10"></div>
                <ResultSection title={titles.future} content={reading.future} icon={titles.icons[2]} />
            </div>
        </Card>
    );
};

interface PastReadingsScreenProps {
    readings: SavedReading[];
    onDelete: (id: string) => void;
}

const PastReadingsScreen: React.FC<PastReadingsScreenProps> = ({ readings, onDelete }) => {
    const { isAuthenticated, showAuth, currentUser } = useAppContext() as any;
    const [selectedReading, setSelectedReading] = useState<SavedReading | null>(null);

    if (!isAuthenticated) {
        return (
             <Card className="animate-fade-in max-w-2xl mx-auto text-center py-20">
                <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; होम</Link>
                <h2 className="text-3xl font-hindi font-bold mb-4">My Readings (Cloud)</h2>
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔒</div>
                <p className="text-purple-200 text-lg mb-6">अपना सहेजा गया डेटा देखने के लिए लॉगिन करें।</p>
                <button onClick={() => showAuth()} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                    लॉगिन / साइन अप
                </button>
            </Card>
        )
    }

    if (selectedReading) {
        return <PastReadingDetail savedReading={selectedReading} onDelete={onDelete} onBack={() => setSelectedReading(null)} />;
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-24">
            <header className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-4">
                    <Link to="/profile" className="p-2 bg-white/10 rounded-full text-purple-300 hover:text-white transition">
                        &larr;
                    </Link>
                    <div>
                        <h2 className="text-2xl font-hindi font-bold text-white">मेरी भविष्यवाणियां</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Cloud Live
                            </p>
                            <span className="text-xs text-gray-500">|</span>
                            <p className="text-xs text-gray-400">{readings.length} Saved Items</p>
                        </div>
                    </div>
                </div>
            </header>
            
            {readings.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 mx-4">
                    <div className="text-6xl mb-4">📜</div>
                    <p className="text-purple-200 text-lg font-hindi">आपने अभी तक कोई रीडिंग सेव नहीं की है।</p>
                    <p className="text-sm text-gray-500 mt-2">भविष्य जानने के लिए होम पेज पर जाएं और 'Save' बटन दबाएं।</p>
                    <Link to="/home" className="mt-6 inline-block px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">होम पर जाएं</Link>
                </div>
            ) : (
                <div className="grid gap-4 px-4">
                    {[...readings].reverse().map(savedReading => (
                        <button
                            key={savedReading.id}
                            onClick={() => setSelectedReading(savedReading)}
                            className="w-full text-left bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-5 hover:border-purple-500/50 hover:from-gray-800 hover:to-gray-700 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-full transition-transform group-hover:scale-150"></div>
                            
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center text-2xl border border-white/5">
                                        {getTitlesForType(savedReading.divinationType).icons[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-hindi font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                                            {savedReading.divinationType}
                                        </h4>
                                        <p className="text-gray-400 text-xs flex items-center gap-2">
                                            <span>📅 {new Date(savedReading.date).toLocaleDateString('hi-IN')}</span>
                                            <span className="bg-white/10 px-1 rounded text-[10px]">Cloud</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    ➔
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastReadingsScreen;
