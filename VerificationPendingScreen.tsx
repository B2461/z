import React from 'react';
import Card from './Card';
import { useAppContext } from '../App';

interface VerificationPendingScreenProps {
    onAcknowledge: () => void;
}

const VerificationPendingScreen: React.FC<VerificationPendingScreenProps> = ({ onAcknowledge }) => {
    const { t } = useAppContext();

    return (
        <Card className="animate-fade-in text-center max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-3xl font-hindi font-bold text-white mb-2">{t('verification_pending_title')}</h2>
            <p className="text-lg text-purple-200 mb-8">
                {t('verification_pending_message')}
            </p>
            <button
                onClick={onAcknowledge}
                className="mt-4 inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
            >
                {t('verification_pending_button')}
            </button>
        </Card>
    );
};

export default VerificationPendingScreen;