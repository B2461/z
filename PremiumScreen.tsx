
import React from 'react';
import Card from './Card';
import { SubscriptionPlan } from '../types';
import { useAppContext } from '../App';

interface PremiumScreenProps {
    onSelectPlan: (plan: SubscriptionPlan & { autoRenew: boolean }) => void;
    isTrialAvailable: boolean;
    onBack: () => void;
}

const plans: SubscriptionPlan[] = [
  { name: 'Weekly Starter', price: 99, durationDays: 7, description: '7 दिन • असीमित चैट + 12 ई-बुक्स', downloadLimit: 12 },
  { name: 'Fortnight Plus', price: 149, durationDays: 15, description: '15 दिन • असीमित चैट + 25 ई-बुक्स', downloadLimit: 25 },
  { name: 'Monthly Pro', price: 299, durationDays: 30, description: '30 दिन • असीमित चैट + 60 ई-बुक्स', badge: 'Popular', downloadLimit: 60 },
  { name: 'Quarterly Elite', price: 699, durationDays: 90, description: '3 महीने • असीमित चैट + 100 ई-बुक्स', downloadLimit: 100 },
  { name: 'Half-Yearly Super', price: 999, durationDays: 180, description: '6 महीने • असीमित चैट + 200 ई-बुक्स', badge: 'Best Value', downloadLimit: 200 },
  { name: 'Yearly Ultimate', price: 1799, durationDays: 365, description: '1 साल • असीमित चैट + सभी ई-बुक्स फ्री', badge: 'VIP', downloadLimit: 999999 }
];

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onSelectPlan, isTrialAvailable, onBack }) => {
    const { t } = useAppContext();

    return (
        <Card className="animate-fade-in max-w-5xl mx-auto border-none !bg-transparent p-0 pb-32">
             <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition z-10">&larr; {t('back')}</button>
            <div className="text-center pt-10">
                <h2 className="text-3xl font-hindi font-bold text-white mb-2">
                    प्रीमियम प्लान्स (VIP Access)
                </h2>
                <p className="text-purple-200 text-sm mb-8">अपनी जरूरत के अनुसार सही प्लान चुनें और असीमित सुविधाओं का आनंद लें।</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
                    {plans.map(plan => (
                        <div key={plan.name} className={`relative p-5 bg-[#1a1a1a] rounded-[2rem] flex flex-col text-center transition-all hover:scale-105 border-2 ${plan.badge ? 'border-yellow-500 shadow-[0_0_25px_rgba(234,179,8,0.2)]' : 'border-white/10'}`}>
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-wider shadow-lg border-2 border-[#1a1a1a]">{plan.badge}</div>
                            )}
                            
                            <h3 className="text-xl font-bold text-white mt-4 mb-2">{plan.name}</h3>
                            
                            <div className="bg-[#2a2a2a] p-4 rounded-2xl mb-4 mx-2">
                                <div className="flex justify-center items-baseline gap-1">
                                    <span className="text-2xl font-bold text-yellow-500">₹</span>
                                    <span className="text-4xl font-black text-yellow-400">{plan.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{plan.durationDays} DAYS</p>
                            </div>
                            
                            <ul className="text-left space-y-3 mb-6 px-2 flex-grow">
                                <li className="flex items-center gap-3 text-xs text-white">
                                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">💬</span> 
                                    असीमित फ्रेंडशिप चैट
                                </li>
                                <li className="flex items-center gap-3 text-xs text-white">
                                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">📚</span> 
                                    {plan.downloadLimit >= 999999 ? 'सभी (All)' : plan.downloadLimit} ई-बुक्स डाउनलोड
                                </li>
                                <li className="flex items-center gap-3 text-xs text-white">
                                    <span className="w-5 h-5 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-[10px]">⭐</span> 
                                    VIP बैच और स्पेशल सपोर्ट
                                </li>
                            </ul>
                            
                            <button 
                                onClick={() => onSelectPlan({ ...plan, autoRenew: false })}
                                className={`w-full py-3 ${plan.badge ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-600 text-black' : 'bg-white/10 text-white hover:bg-white/20'} font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 uppercase text-xs tracking-widest flex items-center justify-center gap-2`}
                            >
                                अभी चुनें 🚀
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-gray-500 text-xs px-6">
                    <p className="font-hindi">नोट: भुगतान के बाद स्क्रीनशॉट अपलोड करना अनिवार्य है। सक्रियण में 24 घंटे तक का समय लग सकता है।</p>
                </div>
            </div>
        </Card>
    );
};

export default PremiumScreen;
