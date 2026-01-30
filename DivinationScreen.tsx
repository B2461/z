
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Fix: UserInput, Reading, and SavedReading are now available in types.ts
import { DivinationType, UserInput, Reading, SavedReading } from '../types';
import InputForm from './InputForm';
import LoadingIndicator from './LoadingIndicator';
import ResultDisplay from './ResultDisplay';
import { generateReading } from '../services/geminiService';
import { useAppContext } from '../App';
import LiveAstrologerScreen from './LiveAstrologerScreen';
import FutureStoryScreen from './FutureStoryScreen';
import TimeManagementScreen from './TimeManagementScreen';
import LocalExpertsScreen from './LocalExpertsScreen';
import HtmlCodeGenerator from './HtmlCodeGenerator';
import PrashnaChakraScreen from './PrashnaChakraScreen';
import { addSavedReading } from '../services/firebaseService';

const DivinationScreen: React.FC = () => {
    const { toolType } = useParams<{ toolType: string }>();
    const navigate = useNavigate();
    const { currentUser, showAuth } = useAppContext();
    
    // Decode toolType from URL safely
    // Fix: DivinationType now contains ASTROLOGY
    const decodedToolType = toolType ? decodeURIComponent(toolType) as DivinationType : DivinationType.ASTROLOGY;

    const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
    const [reading, setReading] = useState<Reading | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [currentInput, setCurrentInput] = useState<UserInput>({});

    const handleSubmit = async (input: UserInput) => {
        setCurrentInput(input);
        setStep('loading');
        setError(null);
        try {
            const result = await generateReading(decodedToolType, input);
            setReading(result);
            setStep('result');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "भविष्यवाणी प्राप्त करने में विफल। कृपया पुनः प्रयास करें।");
            setStep('input');
        }
    };

    const handleReset = () => {
        setReading(null);
        setStep('input');
        setIsSaved(false);
    };

    const handleSave = async () => {
        if (!reading) return;
        
        if (!currentUser?.uid) {
            alert("डेटा को क्लाउड पर सुरक्षित रखने के लिए कृपया लॉगिन करें।");
            showAuth();
            return;
        }
        
        const newSavedReading: SavedReading = {
            id: `reading-${Date.now()}`,
            date: new Date().toISOString(),
            divinationType: decodedToolType,
            reading: reading
        };

        try {
            await addSavedReading(currentUser.uid, newSavedReading);
            setIsSaved(true);
            alert("✅ डेटा सफलतापूर्वक क्लाउड पर सेव हो गया!\n\nअब आप किसी भी डिवाइस से 'My Readings' में इसे देख सकते हैं।");
        } catch (e) {
            console.error(e);
            alert("❌ सेव करने में विफल। कृपया इंटरनेट कनेक्शन चेक करें।");
        }
    };

    // Special Components
    // Fix: DivinationType now contains TIME_MANAGEMENT, LOCAL_EXPERTS, HTML_GENERATOR, LIVE_ASTROLOGER
    if (decodedToolType === DivinationType.TIME_MANAGEMENT) return <TimeManagementScreen onBack={() => navigate('/home')} />;
    if (decodedToolType === DivinationType.LOCAL_EXPERTS) return <LocalExpertsScreen onBack={() => navigate('/home')} />;
    if (decodedToolType === DivinationType.HTML_GENERATOR) return <HtmlCodeGenerator onBack={() => navigate('/home')} />;
    if (decodedToolType === DivinationType.LIVE_ASTROLOGER) return <LiveAstrologerScreen onBack={() => navigate('/home')} />;

    return (
        <div className="w-full">
            {step === 'input' && (
                <InputForm 
                    divinationType={decodedToolType} 
                    onSubmit={handleSubmit} 
                    error={error} 
                    onBack={() => navigate('/home')}
                    userProfile={currentUser}
                />
            )}
            {step === 'loading' && (
                <LoadingIndicator divinationType={decodedToolType} />
            )}
            {step === 'result' && (
                <ResultDisplay 
                    reading={reading} 
                    divinationType={decodedToolType} 
                    onReset={handleReset}
                    onSave={handleSave}
                    isSaved={isSaved}
                />
            )}
        </div>
    );
};

export default DivinationScreen;
