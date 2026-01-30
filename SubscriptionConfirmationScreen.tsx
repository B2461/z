
import React from 'react';
import Card from './Card';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';

interface SubscriptionConfirmationScreenProps {
    expiryDate: string | null;
}

const SubscriptionConfirmationScreen: React.FC<SubscriptionConfirmationScreenProps> = ({ expiryDate }) => {
    const { t } = useAppContext();

    const formattedDate = expiryDate
        ? new Date(expiryDate).toLocaleDateString('hi-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '';

    return (
        <Card className="animate-fade-in text-center max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-3xl font-hindi font-bold text-white mb-2">{t('sub_confirm_title')}</h2>
            
            {/* 24-Hour Notice Banner */}
            <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-2xl mb-6 text-left mx-2 animate-pulse mt-4">
                <div className="flex gap-3 items-start">
                    <span className="text-2xl">⏳</span>
                    <div>
                        <h3 className="text-yellow-400 font-bold font-hindi text-sm mb-1">पेमेंट अप्रूवल लंबित है</h3>
                        <p className="text-yellow-100/80 text-xs font-hindi leading-relaxed">
                            सूचना: 24 घंटे के भीतर पेमेंट अप्रूवल होने के बाद आपकी सदस्यता/प्लान आगे बढ़ाया जाएगा। कृपया प्रतीक्षा करें।
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-lg text-purple-200 mb-6">
                {t('sub_confirm_message')}
                {formattedDate && <b className="text-white block mt-1">{formattedDate}</b>}
            </p>
            <Link to="/" className="mt-4 inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                {t('sub_confirm_button')}
            </Link>
        </Card>
    );
};

export default SubscriptionConfirmationScreen;
