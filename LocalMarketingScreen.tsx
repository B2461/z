
import React from 'react';
import Card from './Card';

const LocalMarketingScreen: React.FC = () => {
    return (
        <Card className="animate-fade-in max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-hindi font-bold mb-4">स्थानीय विपणन</h2>
            <p className="text-purple-200">यह सुविधा वर्तमान में उपलब्ध नहीं है।</p>
        </Card>
    );
};

export default LocalMarketingScreen;
