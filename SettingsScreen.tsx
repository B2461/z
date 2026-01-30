
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';
import AudioPlayer from './AudioPlayer';

interface SettingsScreenProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

const themes = [
    { id: 'cosmic', name: 'ब्रह्मांडीय रात्रि', emoji: '🌌' },
    { id: 'sunrise', name: 'गोधूलि बेला', emoji: '🌆' },
    { id: 'forest', name: 'रात्रि वन', emoji: '🌲' },
    { id: 'saffron', name: 'गहरा भगवा', emoji: '🟠' },
    { id: 'light', name: 'सरल सफेद', emoji: '☀️' },
    { id: 'dark', name: 'सरल काला', emoji: '🌑' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ audioRef }) => {
    const { language, setLanguage, theme, setTheme, t, isAuthenticated, showAuth } = useAppContext();
    const navigate = useNavigate();

    const handleCommunityLink = () => {
        if (isAuthenticated) {
            navigate('/community');
        } else {
            showAuth(() => navigate('/community'));
        }
    };

    return (
        <Card className="animate-fade-in max-w-2xl mx-auto pb-24 text-left">
            <Link to="/" className="absolute top-6 left-6 text-orange-300 hover:text-white transition">&larr; Back</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">Settings</h2>

            <div className="space-y-8">
                {/* Community Hub Section */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3 font-hindi font-bold">सोशल और चर्चा (Social Hub)</label>
                    <button 
                        onClick={handleCommunityLink}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl hover:brightness-110 transition-all group shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💬</div>
                            <div className="text-left">
                                <p className="font-bold text-white text-lg font-hindi">ग्राहक चौपाल</p>
                                <p className="text-blue-200 text-xs">अन्य ग्राहकों से बात करें</p>
                            </div>
                        </div>
                        <div className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">LIVE</div>
                    </button>
                </div>

                {/* Music/Sound Control */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3 font-bold">संगीत (Music)</label>
                    <div className="flex items-center justify-center p-4 bg-white/10 rounded-lg">
                         {audioRef && <AudioPlayer audioRef={audioRef as any} size="lg" />}
                    </div>
                </div>

                {/* Language Selection */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3 font-bold">भाषा (Language)</label>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLanguage('hi')}
                            className={`w-full py-3 rounded-lg border-2 font-semibold transition ${language === 'hi' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-orange-200'}`}
                        >हिन्दी</button>
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`w-full py-3 rounded-lg border-2 font-semibold transition ${language === 'en' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-orange-200'}`}
                        >English</button>
                    </div>
                </div>

                {/* Theme Selection */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3 font-bold">थीम (Theme)</label>
                    <div className="grid grid-cols-3 gap-4">
                        {themes.map(tItem => (
                            <button
                                key={tItem.id}
                                onClick={() => setTheme(tItem.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition ${theme === tItem.id ? 'bg-orange-600 border-orange-400' : 'bg-white/10 border-white/20'}`}
                            >
                                <span className="text-2xl mb-1">{tItem.emoji}</span>
                                <span className="text-[10px] font-bold text-center">{tItem.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Admin Access Section */}
                <div className="pt-6 border-t border-white/10">
                    <label className="block text-orange-200 text-lg mb-3 font-hindi font-bold">ऐप प्रबंधन (Admin)</label>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="w-full flex items-center justify-between p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl hover:bg-purple-900/50 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚙️</div>
                            <div className="text-left">
                                <p className="font-bold text-white text-lg">एडमिन पैनल</p>
                                <p className="text-purple-300 text-sm">मैनेजमेंट उपकरण</p>
                            </div>
                        </div>
                        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <Link to="/terms" className="text-purple-300 hover:text-white underline">Terms & Conditions</Link>
                <span className="mx-4 text-purple-400/60">|</span>
                <Link to="/privacy" className="text-purple-300 hover:text-white underline">Privacy Policy</Link>
            </div>
        </Card>
    );
};

export default SettingsScreen;
