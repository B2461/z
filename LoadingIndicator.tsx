
import React, { useState, useEffect } from 'react';
import { DivinationType } from '../types';

// Define different message sets
const defaultMessages = [
    "सितारे संरेखित हो रहे हैं...",
    "आपके भाग्य की गणना की जा रही है...",
    "प्राचीन ज्ञान से परामर्श किया जा रहा है...",
    "ब्रह्मांड के रहस्य खुल रहे हैं...",
    "आपकी नियति को आकार दिया जा रहा है...",
];

const imageMessages = [
    "पिक्सेल को ईथर से बुलाया जा रहा है...",
    "प्रकाश और कोड के साथ चित्रकारी हो रही है...",
    "आपकी दृष्टि आकार ले रही है...",
    "कलात्मक ऊर्जाएं एकत्रित हो रही हैं...",
    "रंगों को कैनवास पर जीवंत किया जा रहा है...",
];

const videoMessages = [
    "वीडियो रेंडरिंग शुरू हो रही है...",
    "फ्रेम दर फ्रेम जादू पैदा किया जा रहा है...",
    "उच्च-गुणवत्ता वाले पिक्सेल तैयार किए जा रहे हैं...",
    "यह थोड़ा समय ले सकता है, कृपया धैर्य रखें...",
    "आपकी कहानी को जीवंत किया जा रहा है...",
    "आपका वीडियो लगभग तैयार है..."
];

interface LoadingIndicatorProps {
    divinationType: DivinationType | null;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ divinationType }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [currentMessages, setCurrentMessages] = useState(defaultMessages);

    // Fix: DivinationType now contains missing members
    const isImageTask = divinationType === DivinationType.TEXT_TO_IMAGE || 
                        divinationType === DivinationType.TAROT ||
                        divinationType === DivinationType.AI_FACE_READING;
                        
    const isVideoTask = divinationType === DivinationType.STORY_TO_VIDEO || divinationType === DivinationType.IMAGE_TO_VIDEO;

    useEffect(() => {
        if (isImageTask) {
            setCurrentMessages(imageMessages);
        } else if (isVideoTask) {
            setCurrentMessages(videoMessages);
        } else {
            setCurrentMessages(defaultMessages);
        }
        setMessageIndex(0); // Reset index when messages change
    }, [divinationType, isImageTask, isVideoTask]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % currentMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [currentMessages]);
    
    const renderAnimation = () => {
        if (isImageTask) {
            return (
                <div className="image-loading-container mb-8">
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring"></div>
                    <div className="text-6xl">🖼️</div>
                </div>
            );
        }
        if (isVideoTask) {
            return (
                <div className="video-loading-container mb-8">
                    <div className="film-strip"></div>
                </div>
            );
        }
        // Default animation
        return (
            <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-pink-400/50 rounded-full animate-spin [animation-direction:reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🔮</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            {renderAnimation()}
            <h2 className="text-2xl font-semibold text-white mb-2">कृपया प्रतीक्षा करें</h2>
            <p className="text-lg text-purple-200 transition-opacity duration-500 min-h-[56px] flex items-center justify-center">
                {currentMessages[messageIndex]}
            </p>
        </div>
    );
};

export default LoadingIndicator;
