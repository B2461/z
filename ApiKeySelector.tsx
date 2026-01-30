import React from 'react';
import Card from './Card';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
    onBack: () => void;
    error: string | null;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected, onBack, error }) => {
    const handleSelectKey = async () => {
        // The openSelectKey function from the VEP environment is called.
        // We assume success after this is called and trigger the onKeySelected callback to retry the operation.
        await (window as any).aistudio.openSelectKey();
        onKeySelected();
    };

    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <Card className="max-w-2xl">
                <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
                <h2 className="text-3xl font-hindi font-bold text-white mb-4">API कुंजी आवश्यक है</h2>
                <p className="text-lg text-purple-200 mb-6">
                    वीडियो बनाने जैसी उन्नत सुविधाओं का उपयोग करने के लिए, आपको एक API कुंजी चुननी होगी। यह सुनिश्चित करता है कि आपके पास इन शक्तिशाली उपकरणों तक सुरक्षित पहुंच है।
                </p>
                <p className="text-sm text-purple-300 mb-6">
                    API कुंजी के उपयोग के लिए शुल्क लग सकता है। अधिक जानकारी के लिए, कृपया <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">बिलिंग दस्तावेज़</a> देखें।
                </p>
                 {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
                <button
                    onClick={handleSelectKey}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-xl"
                >
                    API कुंजी चुनें
                </button>
            </Card>
        </div>
    );
};

export default ApiKeySelector;