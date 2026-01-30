
import React, { useState, FormEvent, useRef } from 'react';
import Card from './Card';
import { SubscriptionPlan, VerificationRequest, UserProfile } from '../types';
import { useAppContext } from '../App';

const GPayIcon = () => (
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md">
        <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M12 24c6.6 0 12-5.4 12-12S18.6 0 12 0 0 5.4 0 12s5.4 12 12 12z" /><path fill="#FFF" d="M12 10.5c.8 0 1.5.3 2.1.8l1.6-1.6c-1-1-2.4-1.6-3.7-1.6-2.9 0-5.3 2-6.2 4.7l2.9 2.2c.7-2 2.6-3.5 4.9-3.5" /><path fill="#FFF" d="M12 13.5c-1.3 0-2.4-.4-3.3-1.1l-2.9 2.2c1.6 2.3 4.3 3.9 7.4 3.9 2.7 0 5.1-1.1 6.8-2.9l-2.6-2.4c-.9.9-2.2 1.4-4.2 1.4" /><path fill="#FFF" d="M22 12c0-.7-.1-1.3-.2-2H12v4h5.6c-.3 1.3-1 2.4-2.1 3.1l2.6 2.4C20.5 17.6 22 15 22 12" /></svg>
    </div>
);

const PhonePeIcon = () => (
    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-[#5F259F] flex items-center justify-center"><span className="text-white font-bold text-xs">Pe</span></div>
);

const BhimIcon = () => (
    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-md">BHIM</div>
);

interface SubscriptionPaymentScreenProps {
    plan: (SubscriptionPlan & { autoRenew: boolean }) | null;
    userProfile: UserProfile | null;
    onVerificationRequest: (request: Omit<VerificationRequest, 'id' | 'requestDate'>) => void;
    onBack: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const SubscriptionPaymentScreen: React.FC<SubscriptionPaymentScreenProps> = ({ plan, userProfile, onVerificationRequest, onBack }) => {
    const { currentUser } = useAppContext();
    const [userName, setUserName] = useState(userProfile?.name || '');
    const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    if (!plan) return <Card className="text-center"><p>No plan selected.</p><button onClick={onBack}>Go Back</button></Card>;

    // Generate UPI Link centrally so it matches for both buttons and QR Code - Updated for Digi Khata
    const vpa = '919305968628@upi'; 
    const merchantName = 'Digi Khata / Ok-E-Store';
    const transactionNote = `Plan: ${plan.name}`;
    const amount = plan.price.toString();
    const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Generate QR Code URL using a reliable public API (qrserver)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const handlePaymentClick = () => {
        // Only for opening the app directly
        window.location.href = upiLink;
        setShowVerificationForm(true);
        alert("महत्वपूर्ण सूचना:\n\nपेमेंट पूरा करने के बाद, कृपया 'Verify Payment' बटन दबाएं और ट्रांजैक्शन आईडी अपलोड करें।");
    };

    const handleSubmitForVerification = async (e: FormEvent) => {
        e.preventDefault();
        if (transactionId.length < 10 || !screenshot) { setError("विवरण सही से भरें (UTR और स्क्रीनशॉट)।"); return; }

        setIsVerifying(true);
        try {
            const screenshotDataUrl = await fileToBase64(screenshot);
            
            // Show Alert BEFORE processing
            alert("✅ आपका अनुरोध प्राप्त हो गया है!\n\nसूचना: 24 घंटे के भीतर पेमेंट अप्रूवल होने के बाद आपका प्लान एक्टिवेट कर दिया जाएगा। कृपया प्रतीक्षा करें।");

            onVerificationRequest({ 
                userName, userPhone, userEmail: currentUser?.email || '', 
                planName: plan.name, planPrice: plan.price, 
                screenshotDataUrl, transactionId, type: 'SUBSCRIPTION', 
                autoRenew: plan.autoRenew 
            });
        } catch (err) { setError("विफल।"); setIsVerifying(false); }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setScreenshot(e.target.files[0]);
            const preview = await fileToBase64(e.target.files[0]);
            setScreenshotPreview(preview);
        }
    };

    return (
        <Card className="animate-fade-in relative">
             <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <div className="text-center max-w-md mx-auto space-y-6">
                <h2 className="text-3xl font-hindi font-black">प्रीमियम अनलॉक करें</h2>
                <p className="text-lg text-purple-200">{plan.name} - ₹{plan.price}</p>

                {!showVerificationForm ? (
                    <div className="space-y-8">
                        {/* 1. UPI Apps Section */}
                         <div className="bg-gray-800 border-2 border-orange-500/50 rounded-[2.5rem] p-6 shadow-2xl">
                            <p className="text-xs text-gray-400 mb-4 font-bold uppercase">Tap App or Scan QR</p>
                            <div className="grid grid-cols-3 gap-6">
                                <button onClick={handlePaymentClick} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"><GPayIcon /><span className="text-[10px] font-black">GPAY</span></button>
                                <button onClick={handlePaymentClick} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"><PhonePeIcon /><span className="text-[10px] font-black">PHONEPE</span></button>
                                <button onClick={handlePaymentClick} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"><BhimIcon /><span className="text-[10px] font-black">BHIM</span></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 justify-center opacity-50">
                            <div className="h-px bg-white w-12"></div>
                            <span className="text-xs font-bold">OR</span>
                            <div className="h-px bg-white w-12"></div>
                        </div>

                        {/* 2. QR Code Section */}
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                <img 
                                    src={qrCodeUrl} 
                                    alt="Digi Khata Payment QR Code" 
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                            <p className="text-xs text-yellow-400 font-bold animate-pulse">Scan QR to Pay ₹{plan.price}</p>
                        </div>

                        {/* 3. Confirmation Button */}
                        <button onClick={() => setShowVerificationForm(true)} className="w-full py-4 bg-green-600 text-white font-black rounded-2xl uppercase shadow-lg hover:bg-green-500 transition-colors text-xs">
                            Payment Done? Click Here ✅
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitForVerification} className="space-y-4 text-left animate-fade-in">
                        <div className="bg-orange-600/20 p-4 rounded-xl border border-orange-500/30 text-center mb-4">
                            <p className="text-xs text-orange-200">कृपया भुगतान का प्रमाण (Screenshot) अपलोड करें।</p>
                        </div>
                        <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="आपका नाम" className="w-full bg-black/40 p-4 rounded-xl border border-white/10 text-white" required />
                        <input value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="व्हाट्सएप नंबर" className="w-full bg-black/40 p-4 rounded-xl border border-white/10 text-white" required maxLength={10} />
                        <input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Transaction ID (12 Digits)" className="w-full bg-black/40 p-4 rounded-xl border border-white/10 text-white font-mono" required />
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => galleryInputRef.current?.click()} className="py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300 font-bold">📁 गैलरी</button>
                            <button type="button" onClick={() => cameraInputRef.current?.click()} className="py-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-300 font-bold">📸 कैमरा</button>
                        </div>
                        <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                        {screenshotPreview && <img src={screenshotPreview} className="w-full h-32 object-cover rounded-2xl border border-white/10 mt-2" />}
                        {error && <p className="text-red-400 text-center font-bold">{error}</p>}
                        <button type="submit" disabled={isVerifying} className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-3xl uppercase">
                            {isVerifying ? 'Verifying...' : 'सत्यापन अनुरोध भेजें ✅'}
                        </button>
                        <button type="button" onClick={() => setShowVerificationForm(false)} className="w-full text-center text-xs text-gray-400 underline mt-2">वापस जाएं</button>
                    </form>
                )}
            </div>
        </Card>
    );
};

export default SubscriptionPaymentScreen;
