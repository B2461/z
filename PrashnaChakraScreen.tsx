
import React, { useState, FormEvent, useMemo } from 'react';
// Fix: UserInput is now available in types.ts
import { UserInput } from '../types';
import Card from './Card';

interface PrashnaChakraScreenProps {
    onSubmit: (data: UserInput) => void;
    error: string | null;
    onBack: () => void;
}

const prashnaChakraCategories = [
    'नौकरी', 'विवाह', 'व्यापार', 'प्रेम संबंध', 'स्वास्थ्य', 'शिक्षा',
    'धन-लाभ', 'कानूनी मामले', 'यात्रा', 'संपत्ति', 'शत्रु/विवाद',
    'खोई वस्तु', 'नया कार्य', 'संतान', 'पारिवारिक जीवन', 'सामान्य प्रश्न'
];


const PrashnaChakraScreen: React.FC<PrashnaChakraScreenProps> = ({ onSubmit, error, onBack }) => {
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState(prashnaChakraCategories[0]);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const handleSpin = (e: FormEvent) => {
        e.preventDefault();
        if (isSpinning) return;

        if (!question.trim()) {
            setFormError("कृपया अपना प्रश्न दर्ज करें।");
            return;
        }
        if (!category.trim()) {
            setFormError("कृपया एक श्रेणी चुनें।");
            return;
        }
        setFormError(null);

        setIsSpinning(true);
        // Spin multiple times plus a random amount
        const newRotation = rotation + 360 * 5 + Math.random() * 360;
        setRotation(newRotation);

        // Wait for animation to finish before submitting
        setTimeout(() => {
            onSubmit({ question, category });
            // The isSpinning state will be reset when the component unmounts or gameState changes
        }, 4200); // A bit longer than the CSS transition
    };
    
    const categoryLabels = useMemo(() => {
        const angleStep = 360 / prashnaChakraCategories.length;
        return prashnaChakraCategories.map((cat, index) => {
            const angle = angleStep * index;
            const style = {
                transform: `rotate(${angle}deg) translateY(-105px) rotate(${-angle}deg)`
            };
             // A different approach to keep text upright more simply:
            const textStyle = {
                 transform: `rotate(${angle}deg) translate(105px) rotate(${-angle}deg)`
            };

            return (
                 <div key={cat} className="chakra-label-item" style={textStyle}>
                     {cat}
                 </div>
            )
        });
    }, []);


    return (
        <Card className="animate-fade-in">
            <button onClick={onBack} disabled={isSpinning} className="absolute top-6 left-6 text-purple-300 hover:text-white transition disabled:opacity-50">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-2 text-center">Prashna Chakra</h2>
            
            <div className="chakra-container">
                <div className="chakra-pointer"></div>
                <div className="chakra-wheel" style={{ transform: `rotate(${rotation}deg)` }}></div>
                <div className="chakra-labels">{categoryLabels}</div>
                <div className="chakra-center-knob"></div>
            </div>

            <form onSubmit={handleSpin}>
                <fieldset disabled={isSpinning}>
                     <div className="mb-6">
                       <label htmlFor="category" className="block text-purple-200 text-lg mb-2">प्रश्न की श्रेणी चुनें</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                        >
                            {prashnaChakraCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">अपना प्रश्न दर्ज करें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: क्या मुझे यह नई नौकरी स्वीकार करनी चाहिए?"></textarea>
                    </div>
                </fieldset>

                {(error || formError) && <p className="text-red-400 mb-4 text-center">{error || formError}</p>}
                
                <div className="text-center mt-6">
                    <button type="submit" disabled={isSpinning} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg disabled:opacity-60 disabled:cursor-wait">
                         {isSpinning ? 'चक्र घूम रहा है...' : 'चक्र घुमाएं'}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default PrashnaChakraScreen;
