
import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Fix: CustomerDetails is now available in types.ts
import { CartItem, CustomerDetails, VerificationRequest, Order } from '../types';
import Card from './Card';
import { useAppContext } from '../App';
import { addFirestoreOrder } from '../services/firebaseService';

interface CheckoutScreenProps {
    cartItems: CartItem[];
    onPlaceOrder: (customer: CustomerDetails, total: number, paymentMethod: 'PREPAID' | 'COD', orderId: string, screenshotDataUrl?: string, transactionId?: string) => void;
    onVerificationRequest: (request: Omit<VerificationRequest, 'id' | 'requestDate'>) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

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

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ cartItems, onPlaceOrder, onVerificationRequest }) => {
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    
    // Initial State populated from Profile
    const [customer, setCustomer] = useState<CustomerDetails>({
        name: currentUser?.name || '', 
        address: currentUser?.address || '', 
        city: currentUser?.city || '', 
        state: currentUser?.state || '', 
        pincode: currentUser?.pincode || '', 
        phone: currentUser?.phone || '', 
        email: currentUser?.email || '', 
        whatsapp: '',
        landmark: '',
        country: 'India'
    });
    
    const [view, setView] = useState<'details' | 'shipping_payment' | 'payment_selection' | 'manual_verification'>('details');
    const [formError, setFormError] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [orderId] = useState(`ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const totalAmount = cartItems.reduce((total, item) => {
        const discountedPrice = item.mrp - (item.mrp * item.discountPercentage / 100);
        return total + discountedPrice * item.quantity;
    }, 0);
    const total = totalAmount;

    // Validation
    const hasPhysicalItems = cartItems.some(item => item.productType === 'PHYSICAL');
    
    // Payment Logic Logic
    const COD_LIMIT = 350;
    const isCodAvailable = hasPhysicalItems && total <= COD_LIMIT;

    // Central Payment Data - Updated for Digi Khata
    const vpa = '919305968628@upi'; 
    const merchantName = 'Digi Khata / Ok-E-Store';
    const transactionNote = `Order ${orderId}`;
    const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // QR Code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    const handleProceedToOptions = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!customer.name.trim() || !customer.phone.trim()) { setFormError("कृपया नाम और फोन भरें।"); return; }
        
        if (hasPhysicalItems && (!customer.address?.trim() || !customer.pincode?.trim() || !customer.city?.trim())) { 
            setFormError("कृपया पूरा पता, शहर और पिन कोड भरें।"); 
            return; 
        }
        
        setView('shipping_payment');
    };

    const handleCodSelection = async () => {
        if (!isCodAvailable) return;
        setIsVerifying(true);
        const newOrder: Order = { 
            id: orderId, 
            items: cartItems, 
            customer: customer, 
            total, 
            date: new Date().toISOString(), 
            status: 'Processing', 
            paymentMethod: 'COD', 
            paymentStatus: 'PENDING' 
        };
        
        try {
            await addFirestoreOrder(newOrder);
            onPlaceOrder(customer, total, 'COD', orderId);
            navigate(`/orders/${orderId}`);
        } catch (error) {
            console.error("Order save failed", error);
            setFormError("ऑर्डर सेव करने में त्रुटि। इंटरनेट चेक करें।");
            setIsVerifying(false);
        }
    };

    const handleUpiAppClick = () => {
        alert("कृपया ध्यान दें: भुगतान पूरा होने के बाद, अगले स्टेप में 'Transaction ID' और 'Screenhot' अपलोड करना अनिवार्य है।");
        window.location.href = upiLink;
        setView('manual_verification');
    };

    const handleSubmitForVerification = async (e: FormEvent) => {
        e.preventDefault();
        if (transactionId.length < 5 || !screenshot) { setFormError("कृपया सही ट्रांजैक्शन ID और स्क्रीनशॉट अपलोड करें।"); return; }

        setIsVerifying(true);
        try {
            const screenshotDataUrl = await fileToBase64(screenshot);
            
            // 1. SAVE COMPLETE ORDER DATA TO FIRESTORE
            const newOrder: Order = {
                id: orderId,
                items: cartItems,
                customer: customer, // Contains Address, Pincode, Mobile
                total: total,
                date: new Date().toISOString(),
                status: 'Verification Pending', // Shows in User Order History
                paymentMethod: 'PREPAID',
                paymentStatus: 'VERIFICATION_PENDING',
                transactionId: transactionId,
                screenshotDataUrl: screenshotDataUrl
            };

            await addFirestoreOrder(newOrder);

            // 2. SEND NOTIFICATION TO ADMIN (Verification Request)
            onVerificationRequest({
                userName: customer.name, 
                userPhone: customer.phone, 
                userEmail: customer.email,
                planName: `Order #${orderId}`, 
                planPrice: total, 
                screenshotDataUrl, 
                transactionId, 
                type: 'PRODUCT', 
                orderId: orderId, // Links Admin Action to this Order
            });

            // ALERT FOR USER AS REQUESTED
            alert("✅ आपका ऑर्डर सबमिट हो गया है!\n\n24 घंटे के भीतर पेमेंट अप्रूवल होने के बाद आर्डर आगे बढ़ाया जाएगा। कृपया प्रतीक्षा करें।");

            // 3. Clear Cart & Navigate
            onPlaceOrder(customer, total, 'PREPAID', orderId, screenshotDataUrl, transactionId);
            navigate(`/orders/${orderId}`);

        } catch (err) { 
            console.error(err);
            setFormError("डेटा सेव करने में विफल। इंटरनेट कनेक्शन चेक करें।"); 
            setIsVerifying(false); 
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setScreenshot(e.target.files[0]);
            const preview = await fileToBase64(e.target.files[0]);
            setScreenshotPreview(preview);
        }
    };

    return (
        <Card className="animate-fade-in relative min-h-[400px] border-orange-500/20">
            {view === 'details' ? (
                <form onSubmit={handleProceedToOptions} className="max-w-md mx-auto space-y-4 text-left">
                    <h2 className="text-2xl font-hindi font-black text-center mb-6">शिपिंग विवरण</h2>
                    <input placeholder="पूरा नाम / Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full bg-white/10 p-4 rounded-xl border border-white/10 text-white" required />
                    <input placeholder="मोबाइल नंबर / Mobile Number" type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full bg-white/10 p-4 rounded-xl border border-white/10 text-white" required maxLength={10} />
                    
                    {hasPhysicalItems && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 animate-fade-in">
                            <p className="text-xs text-orange-300 font-bold uppercase tracking-widest">घर का पता (Address)</p>
                            <textarea placeholder="मकान नंबर, गली, मोहल्ला" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white h-20" required />
                            
                            <input placeholder="प्रसिद्ध स्थान / Near by famous place name" value={customer.landmark} onChange={e => setCustomer({...customer, landmark: e.target.value})} className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" />

                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="शहर / City" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="bg-black/20 p-3 rounded-lg border border-white/10 text-white" required />
                                <input placeholder="पिन कोड / Pincode" value={customer.pincode} onChange={e => setCustomer({...customer, pincode: e.target.value})} className="bg-black/20 p-3 rounded-lg border border-white/10 text-white" required maxLength={6} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="राज्य / State" value={customer.state} onChange={e => setCustomer({...customer, state: e.target.value})} className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" />
                                <input placeholder="देश / Country" value={customer.country} onChange={e => setCustomer({...customer, country: e.target.value})} className="w-full bg-black/20 p-3 rounded-lg border border-white/10 text-white" />
                            </div>
                        </div>
                    )}

                    {formError && <p className="text-red-400 text-center font-bold text-sm bg-red-900/20 p-2 rounded">{formError}</p>}
                    <button type="submit" className="w-full py-4 bg-orange-600 text-white font-black rounded-xl uppercase shadow-lg shadow-orange-900/50 mt-4">आगे बढ़ें &rarr;</button>
                </form>
            ) : view === 'shipping_payment' ? (
                <div className="text-center space-y-6 max-w-sm mx-auto py-10 animate-fade-in">
                    <h2 className="text-2xl font-black text-white mb-8">भुगतान चुनें</h2>
                    <button onClick={() => setView('payment_selection')} className="w-full p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl border border-white/20 shadow-xl flex items-center justify-center gap-4 group hover:scale-105 transition-all">
                        <div className="text-left"><p className="font-black text-white">Online Pay (Digi Khata)</p><p className="text-purple-200 text-[10px]">Fast Delivery 🚀</p></div>
                        <span className="text-2xl">UPI</span>
                    </button>
                    {hasPhysicalItems && (
                        <div className="relative">
                            <button 
                                onClick={handleCodSelection} 
                                disabled={!isCodAvailable || isVerifying} 
                                className={`w-full p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between group transition-all ${isCodAvailable ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="text-left">
                                    <p className="font-black text-white text-gray-400">कैश ऑन डिलीवरी (COD)</p>
                                    <p className="text-gray-500 text-[10px]">घर पर पैसे दें</p>
                                </div>
                                <span className="text-2xl">💵</span>
                            </button>
                            {!isCodAvailable && <p className="text-[10px] text-red-400 mt-2 font-bold bg-red-900/10 p-1 rounded">COD केवल ₹{COD_LIMIT} तक के ऑर्डर के लिए उपलब्ध है।</p>}
                        </div>
                    )}
                    <button onClick={() => setView('details')} className="text-xs text-gray-400 underline mt-4">विवरण बदलें</button>
                </div>
            ) : view === 'payment_selection' ? (
                <div className="text-center animate-fade-in max-w-md mx-auto space-y-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Digi Khata Payment</h2>
                    
                    {/* 1. UPI Apps */}
                    <div className="bg-gray-800 border-2 border-orange-500/50 rounded-[2.5rem] p-6 shadow-2xl">
                        <p className="text-xs text-gray-400 mb-4 font-bold uppercase">Tap App or Scan QR</p>
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <button onClick={handleUpiAppClick} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"><GPayIcon /><span className="text-[10px] font-black">Google Pay</span></button>
                            <button onClick={handleUpiAppClick} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"><PhonePeIcon /><span className="text-[10px] font-black">PhonePe</span></button>
                            <button onClick={handleUpiAppClick} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"><BhimIcon /><span className="text-[10px] font-black">Paytm / BHIM</span></button>
                        </div>
                        
                        {/* 2. QR Code Display */}
                        <div className="flex flex-col items-center justify-center space-y-2 bg-white/5 p-4 rounded-2xl">
                            <div className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <img 
                                    src={qrCodeUrl} 
                                    alt="Digi Khata QR Code" 
                                    className="w-40 h-40 object-contain"
                                />
                            </div>
                            <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide">Digi Khata QR: ₹{total.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* 3. Manual Verification Button */}
                    <button onClick={() => setView('manual_verification')} className="w-full py-4 bg-green-600 text-white font-black rounded-2xl uppercase shadow-xl hover:bg-green-500 transition-colors">
                        Payment Done? Click Here ✅
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in max-w-md mx-auto text-center space-y-6">
                    <div className="bg-green-900/20 p-5 rounded-3xl border border-green-500/30">
                        <h3 className="text-lg font-black text-green-400 mb-2">भुगतान सत्यापन (Verification)</h3>
                        <p className="text-white font-hindi text-xs leading-relaxed">
                            ऑर्डर कन्फर्म करने के लिए ट्रांजैक्शन आईडी और स्क्रीनशॉट अपलोड करें। यह जानकारी सुरक्षित रूप से एडमिन को भेजी जाएगी।
                        </p>
                    </div>
                    <form onSubmit={handleSubmitForVerification} className="space-y-4 text-left">
                        <div>
                            <label className="text-xs text-gray-400 ml-2">Transaction ID (UTR Number)</label>
                            <input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter 12 Digit UTR" className="w-full bg-black/40 p-4 rounded-xl border border-white/20 text-white font-mono" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => galleryInputRef.current?.click()} className="py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300 font-bold text-xs">📂 गैलरी से चुनें</button>
                            <button type="button" onClick={() => cameraInputRef.current?.click()} className="py-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-300 font-bold text-xs">📸 फोटो खींचें</button>
                        </div>
                        <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                        
                        {screenshotPreview && (
                            <div className="relative group">
                                <img src={screenshotPreview} className="w-full h-40 object-contain rounded-2xl mt-2 border-2 border-green-500/50 bg-black" />
                                <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">Uploaded</div>
                            </div>
                        )}
                        
                        <button type="submit" disabled={isVerifying} className="w-full py-5 bg-green-600 text-white font-black rounded-2xl uppercase shadow-xl hover:bg-green-500 transition-colors mt-4">
                            {isVerifying ? 'सत्यापन हो रहा है...' : 'सबमिट करें और ऑर्डर पाएं ✅'}
                        </button>
                    </form>
                </div>
            )}
        </Card>
    );
};

export default CheckoutScreen;
