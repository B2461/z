
import React, { useState, useEffect, useCallback } from 'react';
import { DivinationType } from '../types';
import { useAppContext } from '../App';
import { showcaseTools } from '../data/tools';

interface ToolShowcaseSliderProps {
    onSelect: (type: DivinationType) => void;
}

const ToolShowcaseSlider: React.FC<ToolShowcaseSliderProps> = ({ onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { tDiv } = useAppContext();

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseTools.length);
    }, []);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 4500); 
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const currentTool = showcaseTools[currentIndex];

    return (
        <div className="w-full max-w-4xl mx-auto mb-6 relative">
            <div 
                key={currentIndex} 
                className={`w-full h-48 sm:h-64 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-orange-500/20 cursor-pointer overflow-hidden active:bg-amber-500/20 active:border-amber-400 active:shadow-[0_0_20px_rgba(251,191,36,0.3)] saffron-glow-slow ${currentTool.imageUrl ? 'p-0 bg-black' : 'p-4 flex flex-row items-center justify-start gap-4'}`}
                onClick={() => onSelect(currentTool.type)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${currentTool.description}`}
            >
                {currentTool.imageUrl ? (
                    <img 
                        src={currentTool.imageUrl} 
                        alt="Special Offer" 
                        className="w-full h-full object-fill"
                    />
                ) : (
                    <>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 border border-white/10 self-center">
                            <span className="text-4xl sm:text-5xl icon-glow icon-float">{currentTool.icon}</span>
                        </div>
                        <div className="text-left slide-content-anim flex-grow overflow-hidden flex flex-col justify-center h-full">
                            {/* English Description */}
                            <p className="text-base sm:text-lg text-white font-bold leading-tight line-clamp-2">
                                {currentTool.description}
                            </p>
                            {/* Hindi Description */}
                            <p className="text-sm sm:text-base text-purple-200 leading-snug mt-1 font-hindi">
                                {currentTool.descriptionHi}
                            </p>
                            
                            <div className="mt-2 pt-2 border-t border-white/10">
                                {/* English Motivational */}
                                <p className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400 italic truncate">
                                    "{currentTool.motivationalText}"
                                </p>
                                {/* Hindi Motivational */}
                                {currentTool.motivationalTextHi && (
                                    <p className="text-xs sm:text-sm text-pink-300/80 font-hindi italic">
                                        "{currentTool.motivationalTextHi}"
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-white/50 self-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </>
                )}
            </div>
            
            <div className="flex justify-center gap-1.5 mt-3 absolute -bottom-5 left-1/2 -translate-x-1/2 w-full overflow-hidden px-4">
                {showcaseTools.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${currentIndex === index ? 'bg-orange-400 scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToolShowcaseSlider;