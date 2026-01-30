
import React, { useState, FormEvent, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import { SupportTicket, VerificationRequest } from '../types';
import { useAppContext } from '../App';

interface SupportTicketScreenProps {
    onCreateTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
    onVerificationRequest: (request: Omit<VerificationRequest, 'id' | 'requestDate'>) => void;
}

const ticketCategories = [
    'Payment Refund', 'उत्पाद डिलीवरी', 'उत्पाद वापसी', 'टूल काम नहीं कर रहा है', 'सदस्यता समस्या', 'भुगतान समस्या', 'अन्य'
];

const SupportTicketScreen: React.FC<SupportTicketScreenProps> = ({ onCreateTicket, onVerificationRequest }) => {
    const { t, currentUser } = useAppContext();
    const navigate = useNavigate();

    // Ticket Form State
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [category, setCategory] = useState(ticketCategories[0]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Bank Details State
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    // New Order ID State
    const [refundOrderId, setRefundOrderId] = useState('');

    const ADMIN_WHATSAPP = '919305968628';

    useEffect(() => {
        if (currentUser) {
            setUserName(currentUser.name || '');
            setUserPhone(currentUser.phone || '');
        }
    }, [currentUser]);

    const handleWhatsAppClick = (type: 'video' | 'image' | 'issue') => {
        let message = '';
        const name = currentUser?.name || 'ग्राहक';
        
        switch(type) {
            case 'video':
                message = `*नमस्ते एडमिन!* 👋\nमैं *${name}* बोल रहा हूँ। मुझे एक उत्पाद की *वीडियो* भेजनी है सहायता के लिए।`;
                break;
            case 'image':
                message = `*नमस्ते एडमिन!* 👋\nमैं *${name}* बोल रहा हूँ। मुझे उत्पाद की *फोटो/स्क्रीनशॉट* शेयर करना है।`;
                break;
            case 'issue':
                message = `*नमस्ते एडमिन!* 👋\nमैं *${name}* बोल रहा हूँ। मुझे अपनी समस्या के बारे में जानकारी देनी है।`;
                break;
        }

        const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleSubmitTicket = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!userName.trim() || !userPhone.trim() || !description.trim()) {
            setError('कृपया सभी आवश्यक फ़ील्ड भरें।');
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(userPhone)) {
            setError('कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।');
            return;
        }

        let bankDetails = undefined;
        let finalRefundOrderId = undefined;

        if (category === 'Payment Refund') {
            if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankName.trim() || !refundOrderId.trim()) {
                setError('रिफंड के लिए कृपया बैंक विवरण और ऑर्डर आईडी भरें।');
                return;
            }
            bankDetails = {
                accountHolderName,
                accountNumber,
                ifscCode,
                bankName
            };
            finalRefundOrderId = refundOrderId;
        }
        
        onCreateTicket({ 
            userName, 
            userPhone, 
            category, 
            description, 
            bankDetails,
            refundOrderId: finalRefundOrderId
        });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <Card className="animate-fade-in text-center max-w-lg mx-auto">
                 <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-hindi font-bold text-white mb-2">{t('ticket_submitted_success_title')}</h2>
                <p className="text-lg text-purple-200 mb-8">
                    {t('ticket_submitted_success_message')}
                </p>
                <button
                    onClick={() => navigate('/home')}
                    className="mt-4 inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                >
                    होम पर जाएं
                </button>
            </Card>
        );
    }

    return (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-6 pb-24">
            <header className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate('/home')} className="p-2 bg-white/5 rounded-full text-purple-300 hover:text-white transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-2xl font-hindi font-black text-white uppercase tracking-widest">सहायता केंद्र</h2>
            </header>

            {/* WHATSAPP SUPPORT SECTION - FREE NOW */}
            <Card className="overflow-hidden relative group border-2 bg-emerald-950/40 border-emerald-500/50">
                <div className="relative z-10 text-left">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-emerald-500">
                                <span className="text-white text-lg">💬</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-hindi font-black uppercase tracking-tight text-emerald-400">व्हाट्सएप सहायता</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="bg-green-600 text-white text-[9px] px-2 py-1 rounded font-black uppercase block mb-1">Active</span>
                        </div>
                    </div>

                    <p className="text-sm text-emerald-200/80 mb-6 font-hindi leading-relaxed">
                        सीधे एडमिन को संदेश भेजें:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={() => handleWhatsAppClick('video')} className="flex flex-col items-center justify-center p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
                            <span className="text-2xl mb-1">🎥</span><span className="text-[10px] font-black uppercase">वीडियो भेजें</span>
                        </button>
                        <button onClick={() => handleWhatsAppClick('image')} className="flex flex-col items-center justify-center p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
                            <span className="text-2xl mb-1">🖼️</span><span className="text-[10px] font-black uppercase">फोटो भेजें</span>
                        </button>
                        <button onClick={() => handleWhatsAppClick('issue')} className="flex flex-col items-center justify-center p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
                            <span className="text-2xl mb-1">🛠️</span><span className="text-[10px] font-black uppercase">अन्य समस्या</span>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Ticket Form */}
            <Card className="!bg-black/40 border-white/10 text-left">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">📝</span>
                    </div>
                    <h3 className="text-xl font-hindi font-black text-white uppercase tracking-tight">टिकट बनाएं (Ticket)</h3>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-5">
                    <div>
                        <label htmlFor="category" className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">{t('ticket_category')}</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none">
                            {ticketCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {category === 'Payment Refund' && (
                        <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/20 animate-fade-in space-y-4">
                            <h4 className="text-sm font-bold text-red-300">बैंक विवरण (रिफंड के लिए)</h4>
                            
                            <div className="bg-black/40 p-3 rounded-lg border border-red-500/30">
                                <label className="text-[10px] font-black text-orange-400 uppercase ml-1 mb-1 block">Order ID (जिसका रिफंड चाहिए)</label>
                                <input 
                                    type="text" 
                                    value={refundOrderId} 
                                    onChange={(e) => setRefundOrderId(e.target.value)} 
                                    placeholder="Ex: #123456" 
                                    className="w-full bg-transparent p-2 text-white outline-none font-mono" 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">खाता धारक का नाम (Account Holder Name)</label>
                                    <input type="text" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">बैंक का नाम (Bank Name)</label>
                                    <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">खाता संख्या (Account Number)</label>
                                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">IFSC कोड</label>
                                    <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" required />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="description" className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">{t('describe_issue')}</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" placeholder="विस्तार से लिखें..." required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="userName" className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">आपका नाम</label>
                            <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" required />
                        </div>
                        <div>
                            <label htmlFor="userPhone" className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">फ़ोन नंबर</label>
                            <input type="tel" id="userPhone" value={userPhone} onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))} className="w-full bg-black/50 p-4 rounded-xl border border-white/10 text-white outline-none" required maxLength={10} />
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-center text-xs">{error}</p>}
                    <div className="text-center pt-4">
                        <button type="submit" className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest border-b-4 border-black/20">
                            {t('submit_ticket')}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default SupportTicketScreen;
