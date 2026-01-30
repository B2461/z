
import React from 'react';
// Fix: UserInput is now available in types.ts
import { UserInput } from '../types';
import Card from './Card';

interface FutureStoryScreenProps {
    userInput: UserInput;
    onReset: () => void;
}

const FutureStoryScreen: React.FC<FutureStoryScreenProps> = ({ onReset }) => {
    return (
        <Card className="animate-fade-in w-full max-w-4xl mx-auto text-center">
            <button onClick={onReset} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6">सुविधा उपलब्ध नहीं है</h2>
            <p className="text-purple-200">यह सुविधा ऐप के इस संस्करण से हटा दी गई है।</p>
        </Card>
    );
};

export default FutureStoryScreen;
