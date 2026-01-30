
import React, { useState, FormEvent, useRef, useEffect } from 'react';
// Fix: UserInput now available in types.ts
import { DivinationType, UserInput, UserProfile } from '../types';
import Card from './Card';
import { generatePalmImage } from '../services/geminiService';
import { toolCategories } from '../data/tools';
import { useAppContext } from '../App';

const base64StringToFile = (base64String: string, filename: string): File => {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    return new File([blob], filename, { type: 'image/jpeg' });
};

const getZodiacSign = (day: number, month: number): { name: string; emoji: string } | null => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'मेष (Aries)', emoji: '♈' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'वृषभ (Taurus)', emoji: '♉' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'मिथुन (Gemini)', emoji: '♊' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'कर्क (Cancer)', emoji: '♋' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'सिंह (Leo)', emoji: '♌' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'कन्या (Virgo)', emoji: '♍' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'तुला (Libra)', emoji: '♎' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'वृश्चिक (Scorpio)', emoji: '♏' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'धनु (Sagittarius)', emoji: '♐' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'मकर (Capricorn)', emoji: '♑' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'कुंभ (Aquarius)', emoji: '♒' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'मीन (Pisces)', emoji: '♓' };
    return null;
};

const zodiacs = [
    { name: 'मेष', emoji: '♈' }, { name: 'वृषभ', emoji: '♉' }, { name: 'मिथुन', emoji: '♊' },
    { name: 'कर्क', emoji: '♋' }, { name: 'सिंह', emoji: '♌' }, { name: 'कन्या', emoji: '♍' },
    { name: 'तुला', emoji: '♎' }, { name: 'वृश्चिक', emoji: '♏' }, { name: 'धनु', emoji: '♐' },
    { name: 'मकर', emoji: '♑' }, { name: 'कुंभ', emoji: '♒' }, { name: 'मीन', emoji: '♓' },
];

const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

const visualStyles = ['सिनेमैटिक (Cinematic)', 'एनिमे (Anime)', 'वास्तविक (Realistic)', 'काल्पनिक (Fantasy)', 'विंटेज (Vintage)', '3D Animation'];

const InputForm: React.FC<InputFormProps> = ({ divinationType, onSubmit, error, onBack, userProfile }) => {
    const { tDiv } = useAppContext();
    // General State
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [timeOfBirth, setTimeOfBirth] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [selectedZodiac, setSelectedZodiac] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('hi');
    const [formError, setFormError] = useState<string | null>(null);
    const [zodiacSign, setZodiacSign] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Disha Shool State
    const [dishaShoolResult, setDishaShoolResult] = useState<{ direction: string; remedy: string; day: string } | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Marriage Compatibility State
    const [boyName, setBoyName] = useState('');
    const [boyDob, setBoyDob] = useState('');
    const [girlName, setGirlName] = useState('');
    const [girlDob, setGirlDob] = useState('');
    
    // Love Compatibility State
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    
    // Future Story State
    const [storyPremise, setStoryPremise] = useState('');

    // Story to Video State
    const [storyScript, setStoryScript] = useState('');
    const [characters, setCharacters] = useState('');
    const [setting, setSetting] = useState('');
    const [visualStyle, setVisualStyle] = useState('');
    const [musicStyle, setMusicStyle] = useState('');
    const [addVoiceOver, setAddVoiceOver] = useState(false);
    const [addCaptions, setAddCaptions] = useState(false);
    const [desiredDuration, setDesiredDuration] = useState('');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    
    // Text to Voice State
    const [voice, setVoice] = useState<'female' | 'male'>('female');

    // Yoga Guide State
    const [selectedYogaDay, setSelectedYogaDay] = useState(1);
    
    // Route Planner State
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');

    const dishaShoolData: { [key: string]: { direction: string; remedy: string } } = {
        'सोमवार': { direction: 'पूर्व (East)', remedy: 'दर्पण देखकर या दूध पीकर यात्रा करें।' },
        'मंगलवार': { direction: 'उत्तर (North)', remedy: 'गुड़ खाकर यात्रा करें।' },
        'बुधवार': { direction: 'उत्तर (North)', remedy: 'धनिया या तिल खाकर यात्रा करें।' },
        'गुरुवार': { direction: 'दक्षिण (South)', remedy: 'दही खाकर यात्रा करें।' },
        'शुक्रवार': { direction: 'पश्चिम (West)', remedy: 'जौ या दही खाकर यात्रा करें।' },
        'शनिवार': { direction: 'पूर्व (East)', remedy: 'अदरक या उड़द खाकर यात्रा करें।' },
        'रविवार': { direction: 'पश्चिम (West)', remedy: 'घी या पान खाकर यात्रा करें।' }
    };

    const daysOfWeek = Object.keys(dishaShoolData);

    // Pre-populate form from user profile
    useEffect(() => {
        if (userProfile) {
            if (!name && userProfile.name) setName(userProfile.name);
            // Fix: UserProfile dob access is now safe as properties are defined in types.ts
            if (!dob && (userProfile as any).dob) setDob((userProfile as any).dob);
            if (!timeOfBirth && (userProfile as any).timeOfBirth) setTimeOfBirth((userProfile as any).timeOfBirth);
            if (!placeOfBirth && (userProfile as any).placeOfBirth) setPlaceOfBirth((userProfile as any).placeOfBirth);
        }
    }, [userProfile, divinationType]);

    const handleDaySelect = (day: string) => {
        setSelectedDay(day);
        setDishaShoolResult({ ...dishaShoolData[day], day: day });
    };

    useEffect(() => {
        // Fix: DivinationType now contains DAILY_FORTUNE_CARD
        if (divinationType === DivinationType.DAILY_FORTUNE_CARD) {
            onSubmit({});
        }
    }, [divinationType, onSubmit]);

    useEffect(() => {
        // Fix: DivinationType now contains ASTROLOGY, NUMEROLOGY, BUSINESS_ASTROLOGY
        if ((divinationType === DivinationType.ASTROLOGY || divinationType === DivinationType.NUMEROLOGY || divinationType === DivinationType.BUSINESS_ASTROLOGY) && dob) {
            try {
                const date = new Date(dob);
                // Check if date is valid
                if (!isNaN(date.getTime())) {
                    const day = date.getUTCDate();
                    const month = date.getUTCMonth() + 1;
                    const sign = getZodiacSign(day, month);
                    if (sign) {
                        setZodiacSign(`${sign.name} ${sign.emoji}`);
                    } else {
                        setZodiacSign(null);
                    }
                } else {
                    setZodiacSign(null);
                }
            } catch (e) {
                setZodiacSign(null);
            }
        } else {
            setZodiacSign(null);
        }
    }, [dob, divinationType]);

    const handleHoroscopeSubmit = (type: 'weekly' | 'monthly' | 'daily') => {
        setFormError(null);
        if (!selectedZodiac) {
            setFormError("कृपया एक राशि चुनें।");
            return;
        }
        onSubmit({ selectedZodiac, horoscopeType: type });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Fix: DivinationType now contains CODE_INSPECTOR
        if (divinationType === DivinationType.CODE_INSPECTOR) {
             if (!question) {
                setFormError("कृपया निरीक्षण करने के लिए एक टूल चुनें।");
                return;
            }
            onSubmit({ question });
            return;
        }

        if (divinationType === DivinationType.SKILL_LEARNING) {
            if (!question.trim()) {
                setFormError("कृपया उस स्किल का नाम लिखें जिसे आप सीखना चाहते हैं।");
                return;
            }
            onSubmit({ question });
            return;
        }

        if (divinationType === DivinationType.BUSINESS_MOTIVATION) {
            // Optional Input, if empty, generic story
            onSubmit({ question });
            return;
        }

        if (divinationType === DivinationType.AUDIO_STORY) {
            if (!question.trim()) {
                setFormError("कृपया कहानी का विषय या प्रकार लिखें (जैसे: डरावनी, प्रेरणादायक, बच्चों के लिए)।");
                return;
            }
            onSubmit({ question });
            return;
        }

        // Fix: DivinationType now contains ROUTE_PLANNER
        if (divinationType === DivinationType.ROUTE_PLANNER) {
            if (!startLocation.trim() || !endLocation.trim()) {
                setFormError("कृपया शुरुआती और गंतव्य स्थान दोनों दर्ज करें।");
                return;
            }
            onSubmit({ startLocation, endLocation });
            return;
        }

        // Fix: DivinationType now contains YOGA_GUIDE_HINDI
        if (divinationType === DivinationType.YOGA_GUIDE_HINDI) {
            onSubmit({ question: selectedYogaDay.toString() });
            return;
        }

        // Fix: DivinationType now contains STORY_TO_VIDEO
        if (divinationType === DivinationType.STORY_TO_VIDEO) {
            if (!storyScript.trim() && !image) {
                setFormError("कृपया वीडियो बनाने के लिए एक स्क्रिप्ट दर्ज करें या एक संदर्भ चित्र अपलोड करें।");
                return;
            }
            const promptParts = [];
            if (storyScript.trim()) promptParts.push(storyScript.trim());
            if (characters.trim()) promptParts.push(`\n\nपात्र (Characters): ${characters.trim()}`);
            if (setting.trim()) promptParts.push(`\n\nसेटिंग (Setting): ${setting.trim()}`);
            if (visualStyle.trim()) promptParts.push(`\n\nदृश्य शैली (Visual Style): ${visualStyle.trim()}`);
            if (musicStyle.trim()) promptParts.push(`\n\nसंगीत (Music): ${musicStyle.trim()}`);
            if (desiredDuration) promptParts.push(`\n\nवांछित वीडियो अवधि (Desired video duration): ${desiredDuration}`);
            if (addVoiceOver) promptParts.push(`\n\nविशेष निर्देश: कहानी का वर्णन करते हुए एक वॉयसओवर शामिल करें।`);
            if (addCaptions) promptParts.push(`\n\nविशेष निर्देश: वीडियो पर हिंदी में सबटाइटल/कैप्शन जोड़ें।`);
            
            const fullPrompt = promptParts.join('');
            onSubmit({ 
                question: fullPrompt, 
                image: image || undefined, 
                resolution, 
                aspectRatio,
                characters,
                setting,
                visualStyle,
                musicStyle,
                addVoiceOver,
                addCaptions,
                desiredDuration
            });
            return;
        }
        
        // Fix: DivinationType now contains FUTURE_STORY
        if (divinationType === DivinationType.FUTURE_STORY) {
            if (!storyPremise.trim()) {
                setFormError("कृपया अपनी कहानी के लिए एक विचार दर्ज करें।");
                return;
            }
            onSubmit({ storyPremise });
            return;
        }
        
        // Fix: DivinationType now contains IMAGE_TO_VIDEO
        if (divinationType === DivinationType.IMAGE_TO_VIDEO) {
            if (!image) {
                setFormError("कृपया वीडियो बनाने के लिए एक चित्र अपलोड करें।");
                return;
            }
            onSubmit({ question: question, image: image || undefined, resolution, aspectRatio });
            return;
        }
        
        // Fix: DivinationType now contains ASTROLOGY, NUMEROLOGY, BUSINESS_ASTROLOGY
        if (divinationType === DivinationType.ASTROLOGY || divinationType === DivinationType.NUMEROLOGY || divinationType === DivinationType.BUSINESS_ASTROLOGY) {
            if (!name || !dob) {
                setFormError("कृपया नाम और जन्म तिथि दोनों दर्ज करें।");
                return;
            }
        }
        // Fix: DivinationType now contains JANAM_KUNDLI
        if (divinationType === DivinationType.JANAM_KUNDLI) {
            if (!name || !dob || !timeOfBirth || !placeOfBirth) {
                setFormError("कृपया नाम, जन्म तिथि, जन्म समय और जन्म स्थान दर्ज करें।");
                return;
            }
        }
        // Fix: DivinationType now contains PALMISTRY
        if (divinationType === DivinationType.PALMISTRY) {
            if (!image) {
                setFormError("कृपया अपनी हथेली का एक चित्र अपलोड करें।");
                return;
            }
        }
        // Fix: DivinationType now contains AI_FACE_READING
        if (divinationType === DivinationType.AI_FACE_READING) {
            if (!image) {
                setFormError("कृपया विश्लेषण के लिए एक चेहरे का चित्र अपलोड करें।");
                return;
            }
        }
        // Fix: DivinationType now contains AI_TIME_MACHINE
        if (divinationType === DivinationType.AI_TIME_MACHINE) {
            if (!image) {
                setFormError("कृपया भविष्य में अपना चेहरा देखने के लिए एक चित्र अपलोड करें।");
                return;
            }
        }
        // Fix: DivinationType now contains OBJECT_COUNTER
        if (divinationType === DivinationType.OBJECT_COUNTER) {
            if (!image) {
                setFormError("कृपया वस्तुओं का एक चित्र अपलोड करें।");
                return;
            }
            if (!question.trim()) {
                setFormError("कृपया उस वस्तु का नाम दर्ज करें जिसकी गिनती करनी है।");
                return;
            }
        }
        // Fix: DivinationType now contains PRODUCT_SCANNER
        if (divinationType === DivinationType.PRODUCT_SCANNER) {
            if (!image) {
                setFormError("कृपया उत्पाद का एक चित्र अपलोड करें।");
                return;
            }
            if (!question.trim()) {
                setFormError("कृपया संदर्भ वस्तु का नाम दर्ज करें।");
                return;
            }
        }
        // Fix: DivinationType now contains MARRIAGE_COMPATIBILITY
        if (divinationType === DivinationType.MARRIAGE_COMPATIBILITY) {
             if (!boyName || !boyDob || !girlName || !girlDob) {
                 setFormError("कृपया वर और वधू दोनों का विवरण भरें।");
                 return;
             }
             onSubmit({ boyName, boyDob, girlName, girlDob });
             return;
        }
        // Fix: DivinationType now contains LOVE_COMPATIBILITY
        if (divinationType === DivinationType.LOVE_COMPATIBILITY) {
             if (!name1 || !name2) {
                 setFormError("कृपया दोनों नाम भरें।");
                 return;
             }
             onSubmit({ name1, name2 });
             return;
        }
        
        // Default fallback for question-based tools
        if (!question && !name && !image && !selectedZodiac && !dob) {
             // Fix: DivinationType now contains missing members
             const questionTools = [DivinationType.TAROT, DivinationType.PRASHNA_CHAKRA, DivinationType.DREAM, DivinationType.AI_FUTURE_GENERATOR];
             if (questionTools.includes(divinationType) && !question.trim()) {
                 setFormError("कृपया अपना प्रश्न लिखें।");
                 return;
             }
        }

        // Generic submit
        onSubmit({ 
            name, dob, timeOfBirth, placeOfBirth, image, question, 
            selectedZodiac, selectedMonth, targetLanguage,
            zodiacSign: zodiacSign || undefined,
            voice,
            startLocation, endLocation,
            storyPremise
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    return (
        <Card className="animate-fade-in w-full max-w-lg mx-auto">
            <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {tDiv(divinationType).hi}
            </h2>

            <form onSubmit={handleSubmit}>
                {/* New: Skill Learning Input */}
                {divinationType === DivinationType.SKILL_LEARNING && (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-lg mb-2">कौन सी नई स्किल सीखना चाहते हैं?</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                            placeholder="उदा: Digital Marketing, Coding, Cooking..."
                        />
                        <p className="text-xs text-gray-400 mt-2">अपने पैरों पर खड़े होने के लिए सही मार्गदर्शन पाएं।</p>
                    </div>
                )}

                {/* New: Business Motivation Input */}
                {divinationType === DivinationType.BUSINESS_MOTIVATION && (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-lg mb-2">किस क्षेत्र (Industry) की कहानी सुनना चाहेंगे?</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                            placeholder="उदा: Tech, Retail, Clothing... (खाली छोड़ें रैंडम के लिए)"
                        />
                    </div>
                )}

                {/* New: Audio Story Input */}
                {divinationType === DivinationType.AUDIO_STORY && (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-lg mb-2">कहानी का विषय या प्रकार?</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                            placeholder="उदा: प्रेरणादायक, बच्चों की कहानी, रहस्यमयी..."
                        />
                    </div>
                )}

                {/* Standard Astrology Inputs */}
                {(divinationType === DivinationType.ASTROLOGY || divinationType === DivinationType.NUMEROLOGY || divinationType === DivinationType.BUSINESS_ASTROLOGY || divinationType === DivinationType.JANAM_KUNDLI) && (
                    <>
                        <div className="mb-4">
                            <label className="block text-purple-200 text-sm mb-2">आपका नाम (Name)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                                placeholder="अपना नाम लिखें"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-purple-200 text-sm mb-2">जन्म तिथि (Date of Birth)</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                            />
                        </div>
                        {/* Time and Place optional/included for Kundli */}
                        {(divinationType === DivinationType.JANAM_KUNDLI || divinationType === DivinationType.ASTROLOGY) && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-purple-200 text-sm mb-2">जन्म समय (Time)</label>
                                    <input
                                        type="time"
                                        value={timeOfBirth}
                                        onChange={(e) => setTimeOfBirth(e.target.value)}
                                        className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-purple-200 text-sm mb-2">जन्म स्थान (Place)</label>
                                    <input
                                        type="text"
                                        value={placeOfBirth}
                                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                                        className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                                        placeholder="शहर का नाम"
                                    />
                                </div>
                            </div>
                        )}
                        {zodiacSign && (
                            <div className="mb-6 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                                <p className="text-purple-200 text-sm">आपकी राशि:</p>
                                <p className="text-xl font-bold text-white mt-1">{zodiacSign}</p>
                            </div>
                        )}
                    </>
                )}

                {/* Compatibility Inputs */}
                {divinationType === DivinationType.MARRIAGE_COMPATIBILITY && (
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="text-lg font-bold text-purple-300 mb-3">वर का विवरण (Boy)</h3>
                            <input type="text" value={boyName} onChange={e => setBoyName(e.target.value)} placeholder="नाम" className="w-full bg-black/20 p-3 rounded-lg mb-2 text-white border border-white/10" />
                            <input type="date" value={boyDob} onChange={e => setBoyDob(e.target.value)} className="w-full bg-black/20 p-3 rounded-lg text-white border border-white/10" />
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="text-lg font-bold text-pink-300 mb-3">वधू का विवरण (Girl)</h3>
                            <input type="text" value={girlName} onChange={e => setGirlName(e.target.value)} placeholder="नाम" className="w-full bg-black/20 p-3 rounded-lg mb-2 text-white border border-white/10" />
                            <input type="date" value={girlDob} onChange={e => setGirlDob(e.target.value)} className="w-full bg-black/20 p-3 rounded-lg text-white border border-white/10" />
                        </div>
                    </div>
                )}

                {divinationType === DivinationType.LOVE_COMPATIBILITY && (
                    <div className="space-y-4 mb-6">
                        <input type="text" value={name1} onChange={e => setName1(e.target.value)} placeholder="आपका नाम" className="w-full bg-white/10 p-3 rounded-lg text-white border border-white/20" />
                        <span className="block text-center text-2xl">❤️</span>
                        <input type="text" value={name2} onChange={e => setName2(e.target.value)} placeholder="साथी का नाम" className="w-full bg-white/10 p-3 rounded-lg text-white border border-white/20" />
                    </div>
                )}

                {/* Horoscope Inputs */}
                {(divinationType === DivinationType.HOROSCOPE || divinationType === DivinationType.DAILY_HOROSCOPE || divinationType === DivinationType.ZODIAC) && (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-lg mb-2">अपनी राशि चुनें</label>
                        <select
                            value={selectedZodiac}
                            onChange={(e) => setSelectedZodiac(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white"
                        >
                            <option value="" className="text-black">चुनें...</option>
                            {zodiacs.map((z) => (
                                <option key={z.name} value={z.name} className="text-black">{z.name} {z.emoji}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Question Input for various tools */}
                {(divinationType === DivinationType.TAROT || divinationType === DivinationType.DREAM || divinationType === DivinationType.AI_FUTURE_GENERATOR) && (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-sm mb-2">
                            {divinationType === DivinationType.DREAM ? 'अपना सपना बताएं (Describe your dream)' : 'अपना प्रश्न पूछें (Ask your question)'}
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition text-white h-24 resize-none"
                            placeholder="यहाँ लिखें..."
                        />
                    </div>
                )}

                {/* Image Upload Inputs */}
                {(divinationType === DivinationType.PALMISTRY || divinationType === DivinationType.AI_FACE_READING || divinationType === DivinationType.AI_TIME_MACHINE || divinationType === DivinationType.OBJECT_COUNTER || divinationType === DivinationType.PRODUCT_SCANNER || divinationType === DivinationType.TEXT_TO_IMAGE) && (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-lg mb-4 text-center">
                            {divinationType === DivinationType.PALMISTRY ? 'हथेली का फोटो अपलोड करें' : 
                             divinationType === DivinationType.AI_FACE_READING ? 'चेहरे का फोटो अपलोड करें' : 
                             'फोटो अपलोड करें'}
                        </label>
                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={() => galleryInputRef.current?.click()} className="px-6 py-3 bg-purple-600/30 border border-purple-500/50 rounded-xl text-white font-bold hover:bg-purple-600/50 transition-all">📂 गैलरी</button>
                            <button type="button" onClick={() => cameraInputRef.current?.click()} className="px-6 py-3 bg-blue-600/30 border border-blue-500/50 rounded-xl text-white font-bold hover:bg-blue-600/50 transition-all">📸 कैमरा</button>
                        </div>
                        <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                        {image && (
                            <div className="mt-4 text-center">
                                <img src={URL.createObjectURL(image)} alt="Preview" className="h-40 mx-auto rounded-lg border border-white/20 object-contain" />
                                <p className="text-xs text-green-400 mt-2">फोटो चुना गया ✅</p>
                            </div>
                        )}
                    </div>
                )}

                {(error || formError) && <p className="text-red-400 mb-6 text-center bg-red-900/20 p-2 rounded">{error || formError}</p>}

                <div className="text-center">
                    <button
                        type="submit"
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:shadow-purple-500/60 hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                    >
                        परिणाम देखें ✨
                    </button>
                </div>
            </form>
        </Card>
    );
};

interface InputFormProps {
    divinationType: DivinationType;
    onSubmit: (data: UserInput) => void;
    error: string | null;
    onBack: () => void;
    userProfile: UserProfile | null;
}

export default InputForm;
