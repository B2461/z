
import React from 'react';
import Card from './Card';

interface HtmlCodeGeneratorProps {
    onBack: () => void;
}

const HtmlCodeGenerator: React.FC<HtmlCodeGeneratorProps> = ({ onBack }) => {
    return (
        <Card className="animate-fade-in max-w-4xl mx-auto text-center">
            <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6">HTML कोड जेनरेटर</h2>
            <p className="text-purple-200">यह सुविधा वर्तमान में उपलब्ध नहीं है।</p>
        </Card>
    );
};

export default HtmlCodeGenerator;
