
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';

interface WelcomeScreenProps {
    onStart: () => void;
}

const promoSlides = [
    { id: 1, icon: '📜', title: 'तंत्र मंत्र रहस्य', desc: 'प्राचीन गोपनीय विद्याएं अब आपके स्मार्टफोन में। सिद्ध मंत्रों का असली खजाना।', category: 'PDF E-BOOKS', color: 'from-purple-900/80 to-black' },
    { id: 2, icon: '🎧', title: 'Next-Gen Audio', desc: 'प्रीमियम वायरलेस इयरबड्स - महसूस करें हर धुन को। भारी डिस्काउंट के साथ।', category: 'ELECTRONICS', color: 'from-blue-900/80 to-black' },
    { id: 3, icon: '🔮', title: 'AI भविष्य प्रेडिक्शन', desc: 'आर्टिफिशियल इंटेलिजेंस से जानें अपने भविष्य की सटीक जानकारी।', category: 'ASTROLOGY', color: 'from-indigo-900/80 to-black' },
    { id: 4, icon: '💹', title: 'अमीर बनने का राज', desc: 'शेयर मार्केट और ट्रेडिंग का मास्टर कोर्स। आज ही अपनी कमाई शुरू करें।', category: 'FINANCE', color: 'from-emerald-900/80 to-black' },
    { id: 5, icon: '💎', title: 'सिद्ध रत्न भंडार', desc: 'अपनी राशि के अनुसार 100% असली और प्राण प्रतिष्ठित रत्न प्राप्त करें।', category: 'GEMS', color: 'from-amber-900/80 to-black' },
    { id: 6, icon: '🤳', title: 'कंटेंट क्रिएटर किट', desc: 'बेहतरीन सेल्फी स्टिक और ट्राइपॉड। अपने वीडियो को दें प्रोफेशनल लुक।', category: 'GADGETS', color: 'from-rose-900/80 to-black' },
    { id: 7, icon: '🧘', title: 'योग और आरोग्य', desc: 'आयुर्वेद और योग की सम्पूर्ण गाइड। स्वस्थ जीवन की ओर कदम बढ़ाएं।', category: 'HEALTH', color: 'from-teal-900/80 to-black' },
    { id: 8, icon: '👞', title: 'स्टाइलिश स्टेप्स', desc: 'लेटेस्ट ट्रेंड के जूते और चप्पल। मजबूती और स्टाइल का अनोखा संगम।', category: 'FOOTWEAR', color: 'from-orange-900/80 to-black' },
    { id: 9, icon: '🏘️', title: 'वास्तु दोष निवारण', desc: 'अपने घर और ऑफिस की नकारात्मक ऊर्जा को दूर करने के अचूक उपाय।', category: 'VASTU', color: 'from-cyan-900/80 to-black' },
    { id: 10, icon: '🗣️', title: 'स्मार्ट इंग्लिश गुरु', desc: 'बिना डरे फर्राटेदार इंग्लिश बोलना सीखें। 30 दिनों का क्रैश कोर्स।', category: 'SKILLS', color: 'from-violet-900/80 to-black' },
    { id: 11, icon: '🧸', title: 'किड्स फन ज़ोन', desc: 'बोलने वाले खिलौने और सीखने के टूल्स। बच्चों के विकास के लिए बेस्ट।', category: 'TOYS', color: 'from-pink-900/80 to-black' },
    { id: 12, icon: '👜', title: 'प्रीमियम एक्सेसरीज', desc: 'ट्रेंडी लेडीज बैग्स और जेंट्स बेल्ट। आपकी पर्सनालिटी को चार चाँद लगाएं।', category: 'FASHION', color: 'from-gray-900/80 to-black' },
    { id: 13, icon: '💰', title: 'डिजिटल रिसेल बिजनेस', desc: 'कोर्स बेचें और 100% प्रॉफिट कमाएं। घर बैठे बिजनेस शुरू करने का मौका।', category: 'EARNING', color: 'from-green-900/80 to-black' },
    { id: 14, icon: '⚡', title: 'VIP मेम्बरशिप', desc: 'एक बार सब्सक्राइब करें और साल भर सभी PDF मुफ्त में डाउनलोड करें।', category: 'MEMBERSHIP', color: 'from-yellow-900/80 to-black' },
    { id: 15, icon: '🕉️', title: 'पूजन सामग्री स्टोर', desc: 'शुद्ध और सात्विक पूजन सामग्री। आपके हर अनुष्ठान के लिए उपलब्ध।', category: 'SPIRITUAL', color: 'from-red-900/80 to-black' },
    { id: 16, icon: '⌚', title: 'Smart Watch Era', desc: 'अपनी कलाई पर दुनिया। फिटनेस ट्रैकिंग और स्मार्ट फीचर्स के साथ।', category: 'WEARABLES', color: 'from-blue-800/80 to-black' },
    { id: 17, icon: '💡', title: 'Home Decor Lights', desc: 'अपने घर को सजाएं। फैंसी लाइट्स और डेकोरेशन आइटम्स का संग्रह।', category: 'LIFESTYLE', color: 'from-amber-700/80 to-black' },
    { id: 18, icon: '🎮', title: 'Pro Gaming Gear', desc: 'गेमर्स के लिए खास। ट्रिगर्स, कूलिंग फैन और गेमिंग एक्सेसरीज।', category: 'GAMING', color: 'from-red-700/80 to-black' },
    { id: 19, icon: '🍳', title: 'Smart Kitchen', desc: 'किचन का काम आसान करें। स्मार्ट चॉपर और आधुनिक ब्लेंडर्स।', category: 'HOME', color: 'from-green-700/80 to-black' },
    { id: 20, icon: '🎁', title: 'Refer & Earn', desc: 'दोस्तों को आमंत्रित करें और हर सफल रेफरल पर कैशबैक कमाएं।', category: 'REWARDS', color: 'from-purple-800/80 to-black' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    const { t } = useAppContext();
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(nextSlide, 4000); 
        return () => clearInterval(timer);
    }, [nextSlide]);
    
    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in min-h-screen py-6 px-4">
            <Card className="max-w-4xl w-full !bg-black/40 border-orange-500/20 shadow-2xl relative overflow-hidden p-4 sm:p-10">
                <div className="absolute -top-10 -right-10 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-hindi font-black text-white mb-2 tracking-tight drop-shadow-lg">
                        {t('welcome_greeting')}
                    </h2>
                    <p className="text-xs sm:text-lg text-orange-400 font-bold mb-8 uppercase tracking-[0.3em] opacity-80">{t('welcome_subtitle')}</p>

                    <div className="w-full h-[300px] sm:h-[380px] rounded-[2.5rem] overflow-hidden mb-8 relative group bg-black/60 shadow-[0_0_50px_rgba(255,100,0,0.15)] border border-white/5">
                        <div key={currentSlide} className={`absolute inset-0 bg-gradient-to-br ${promoSlides[currentSlide].color} transition-all duration-1000 flex flex-col items-center justify-center p-6 gap-4 sm:gap-8 animate-slide-content`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] opacity-50"></div>

                            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-white/5 border border-white/20 flex items-center justify-center relative flex-shrink-0 backdrop-blur-md shadow-2xl transform transition-transform duration-700 hover:scale-110">
                                <span className="text-5xl sm:text-7xl drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]">
                                    {promoSlides[currentSlide].icon}
                                </span>
                                <div className="absolute inset-0 rounded-full border border-dashed border-white/30 animate-spin [animation-duration:15s]"></div>
                            </div>

                            <div className="text-center relative z-10 max-w-2xl px-2">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-[9px] sm:text-[10px] font-black rounded-full mb-2 tracking-[0.2em] uppercase shadow-lg">
                                    ★ {promoSlides[currentSlide].category} ★
                                </span>
                                <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-hindi mb-2 drop-shadow-xl leading-tight">
                                    {promoSlides[currentSlide].title}
                                </h3>
                                <p className="text-xs sm:text-base text-purple-100 font-hindi leading-relaxed opacity-90 font-medium line-clamp-2">
                                    {promoSlides[currentSlide].desc}
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 overflow-hidden px-10 z-20">
                            {promoSlides.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setCurrentSlide(i)}
                                    className={`h-1 rounded-full transition-all duration-500 flex-shrink-0 backdrop-blur-sm ${i === currentSlide ? 'w-6 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center w-full mb-10">
                        {/* REVERTED: Original Saffron Gradient Button */}
                        <button 
                            onClick={onStart}
                            className="group relative px-12 py-5 bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white font-hindi font-black text-xl sm:text-2xl rounded-full shadow-[0_10px_40px_rgba(234,88,12,0.4)] hover:shadow-[0_15px_50px_rgba(234,88,12,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 border-t border-white/30"
                        >
                            <span className="drop-shadow-lg">{t('start_journey')}</span>
                            <span className="text-3xl group-hover:translate-x-2 transition-transform duration-300">➔</span>
                            
                            {/* Inner Glow Effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>

                    <p className="mt-4 text-[10px] text-gray-400 font-hindi leading-relaxed max-w-md mx-auto">
                        शुरू करने पर आप 
                        <Link to="/terms" className="text-orange-400 hover:text-white transition font-bold mx-1 hover:underline">नियम और शर्तों</Link> 
                        और 
                        <Link to="/privacy" className="text-orange-400 hover:text-white transition font-bold mx-1 hover:underline">गोपनीयता नीति</Link>
                        से सहमत होते हैं।
                    </p>

                    <div className="mt-12 relative inline-flex items-center">
                        <div className="px-10 py-5 bg-[#050508] border-2 border-blue-600 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.3)] relative group overflow-hidden">
                            <div className="absolute top-0 left-4 w-6 h-1 bg-blue-500 rounded-full"></div>
                            <div className="absolute bottom-0 right-4 w-6 h-1 bg-blue-500 rounded-full"></div>
                            
                            <h3 className="text-xl sm:text-3xl font-mono font-black uppercase tracking-wider text-blue-500 drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]">
                                Powered by <br className="sm:hidden" />
                                <span className="text-2xl sm:text-4xl text-blue-400">ok-e-store technology</span>
                            </h3>
                            
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default WelcomeScreen;
