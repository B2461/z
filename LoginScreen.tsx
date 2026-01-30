
import React, { useState, FormEvent } from 'react';
import { UserProfile } from '../types';

interface LoginScreenProps {
    onClose: () => void;
    onLogin: (email: string, password: string) => Promise<string | null>;
    onSignup: (profile: UserProfile) => Promise<boolean>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onClose, onLogin, onSignup }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const cleanEmail = email.trim();
        
        if (!cleanEmail || !password) {
            setError('कृपया ईमेल और पासवर्ड दोनों दर्ज करें।');
            return;
        }
        
        // Basic Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
             setError('कृपया एक मान्य ईमेल पता दर्ज करें।');
             return;
        }

        setIsLoading(true);
        const errorMessage = await onLogin(cleanEmail, password);
        setIsLoading(false);
        
        if (errorMessage) {
            // Check for user-not-found specifically (based on Firebase typical response text or handling in App.tsx)
            if (errorMessage.toLowerCase().includes('user-not-found') || errorMessage.toLowerCase().includes('no user')) {
                setError('यह खाता मौजूद नहीं है। कृपया पहले "साइन अप" करें।');
            } else {
                setError(errorMessage);
            }
        }
    };

    const handleSignupSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const cleanEmail = email.trim();
        const cleanName = name.trim();
        const cleanPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits

        if (!cleanName || !cleanEmail || !password || !cleanPhone) {
            setError('कृपया सभी फ़ील्ड भरें।');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('पासवर्ड मेल नहीं खाते।');
            return;
        }
        
        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
             setError('कृपया एक मान्य ईमेल पता दर्ज करें।');
             return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(cleanPhone)) {
            setError('कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।');
            return;
        }
        
        setIsLoading(true);
        const success = await onSignup({ name: cleanName, email: cleanEmail, password, phone: cleanPhone });
        setIsLoading(false);
        if (!success) {
            setError('साइन अप विफल रहा (शायद ईमेल पहले से उपयोग में है)।');
        }
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* New User Guidance Banner */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-2 flex items-start gap-3 animate-fade-in">
                <span className="text-xl">👋</span>
                <div>
                    <p className="text-yellow-400 text-xs font-bold mb-1">नये यूजर हैं?</p>
                    <p className="text-gray-300 text-[10px] leading-tight">
                        सीधे लॉगिन न करें। अगर आपका खाता नहीं है, तो पहले <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-yellow-300 underline font-bold hover:text-white transition">नया खाता (Sign Up)</button> बनाएं।
                    </p>
                </div>
            </div>

            <h2 className="text-2xl font-hindi font-bold text-white mb-2 text-center">लॉगिन करें</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ईमेल" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="पासवर्ड" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            
            {error && <p className="text-red-400 text-center text-sm p-2 bg-red-900/30 rounded border border-red-500/30">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg disabled:opacity-60 hover:scale-105 transition-transform">
                {isLoading ? 'प्रतीक्षा करें...' : 'लॉगिन करें'}
            </button>
        </form>
    );

    const renderSignupForm = () => (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
            <h2 className="text-2xl font-hindi font-bold text-white mb-4 text-center">नया खाता बनाएं</h2>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-2 mb-2 text-center">
                <p className="text-green-300 text-[10px]">यहाँ अपनी जानकारी भरकर रजिस्टर करें</p>
            </div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="पूरा नाम" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ईमेल" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} placeholder="10-अंकीय फ़ोन नंबर" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="पासवर्ड" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="पासवर्ड की पुष्टि करें" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 text-white outline-none focus:border-purple-500 transition"/>
            {error && <p className="text-red-400 text-center text-sm p-2 bg-red-900/30 rounded border border-red-500/30">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg disabled:opacity-60 hover:scale-105 transition-transform">
                {isLoading ? 'प्रतीक्षा करें...' : 'साइन अप करें'}
            </button>
        </form>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900/95 border border-purple-500/30 shadow-2xl rounded-2xl p-8 max-w-sm w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-purple-300 hover:text-white text-3xl transition">&times;</button>
                
                <div className="flex justify-center border-b border-white/20 mb-6">
                    <button onClick={() => { setMode('login'); setError(''); }} className={`w-full text-center p-3 font-semibold transition ${mode === 'login' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300 hover:text-white'}`}>लॉगिन</button>
                    <button onClick={() => { setMode('signup'); setError(''); }} className={`w-full text-center p-3 font-semibold transition ${mode === 'signup' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300 hover:text-white'}`}>साइन अप</button>
                </div>

                {mode === 'login' ? renderLoginForm() : renderSignupForm()}
            </div>
        </div>
    );
};

export default LoginScreen;
