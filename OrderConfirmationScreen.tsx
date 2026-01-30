
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Order, CartItem } from '../types';
import Card from './Card';
import { useAppContext } from '../App';
import { updateFirestoreOrder } from '../services/firebaseService';

interface OrderConfirmationScreenProps {
    orders: Order[];
}

const OrderTracker: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    let currentStepIndex = steps.indexOf(status);
    if (status === 'Completed' || status === 'Delivered') currentStepIndex = 3;
    if (status === 'Verification Pending') currentStepIndex = -1;

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4">
            <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-1 bg-white/10 z-0"></div>
                <div 
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 z-0 transition-all duration-1000" 
                    style={{ width: `${currentStepIndex < 0 ? 0 : (currentStepIndex / 3) * 100}%` }}
                ></div>

                {steps.map((step, index) => (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${index <= currentStepIndex ? 'bg-green-600 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110' : 'bg-slate-900 border-white/10 grayscale'}`}>
                            {index <= currentStepIndex ? (
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : <span className="text-[10px] text-white/20 font-black">{index + 1}</span>}
                        </div>
                        <span className={`text-[8px] font-black uppercase mt-3 tracking-tighter ${index <= currentStepIndex ? 'text-green-400' : 'text-gray-600'}`}>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({ orders }) => {
    const { orderId } = useParams<{ orderId: string }>();
    const { setOrders } = useAppContext() as any;
    const order = orders.find(o => o.id === orderId);
    const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);
    
    const handleDownload = async (item: CartItem) => {
        if (!item.googleDriveLink) {
            alert("इस प्रोडक्ट का डाउनलोड लिंक उपलब्ध नहीं है। कृपया एडमिन से संपर्क करें।");
            return;
        }

        const currentCount = item.downloadCount || 0;
        const max = 5;

        if (currentCount >= max) {
            alert("क्षमा करें, आपने इस ई-बुक की 5 डाउनलोड सीमा पूरी कर ली है।");
            return;
        }

        // FIX: Open the window IMMEDIATELY to prevent browser popup blockers.
        // Do not await DB operations before opening the window.
        window.open(item.googleDriveLink, '_blank');
        
        // Increment count in FIRESTORE (Persist state) in BACKGROUND
        if (order) {
            const updatedItems = order.items.map(i => i.id === item.id ? { ...i, downloadCount: (i.downloadCount || 0) + 1 } : i);
            
            // Optimistic update locally
            const updatedOrders = orders.map(o => {
                if (o.id === order.id) {
                    return { ...o, items: updatedItems };
                }
                return o;
            });
            setOrders(updatedOrders);

            // Update in Firestore asynchronously
            updateFirestoreOrder(order.id, { items: updatedItems }).catch(err => {
                console.error("Failed to update download count in background", err);
            });
        }
    };

    const copyLink = async (link: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link);
                alert("लिंक कॉपी हो गया! ब्राउज़र में पेस्ट करें। ✅");
            } else {
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = link;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    alert("लिंक कॉपी हो गया! ब्राउज़र में पेस्ट करें। ✅");
                } else {
                    throw new Error("Fallback copy failed");
                }
            } catch (fallbackErr) {
                console.error('Copy failed', fallbackErr);
                window.prompt("कॉपी करने के लिए लिंक चुनें और Ctrl+C दबाएं:", link);
            }
        }
    }

    // Auto-download logic for digital products when approved
    useEffect(() => {
        if (order && order.paymentStatus === 'COMPLETED' && !autoDownloadTriggered) {
            const digitalItems = order.items.filter(i => i.productType === 'DIGITAL' && i.googleDriveLink);
            if (digitalItems.length > 0) {
                // Auto download the first digital item if limit not reached
                const firstItem = digitalItems[0];
                if ((firstItem.downloadCount || 0) < 5) {
                    // Small delay to ensure UI renders
                    const timer = setTimeout(() => handleDownload(firstItem), 1000);
                    setAutoDownloadTriggered(true);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [order, autoDownloadTriggered]);

    if (!order) return <Card className="text-center font-hindi py-20">आर्डर नहीं मिला</Card>;

    const digitalItems = order.items.filter(i => i.productType === 'DIGITAL');
    const physicalItems = order.items.filter(i => i.productType === 'PHYSICAL');

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-24 text-left">
            <header className="flex justify-between items-center mb-6">
                <Link to="/orders" className="text-purple-300 font-bold">&larr; बैक</Link>
                <h2 className="text-xl font-hindi font-black text-white uppercase tracking-widest">Order Details</h2>
                <div className="w-8"></div>
            </header>

            <Card className="!bg-black/60 border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"></div>
                <h2 className="text-4xl font-hindi font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2 mt-4">
                    {order.paymentStatus === 'COMPLETED' ? 'सत्यापित! ✅' : 'धन्यवाद!'}
                </h2>
                <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest mb-6">ID: #{order.id.slice(-12).toUpperCase()}</p>

                {/* VERIFICATION PENDING NOTICE */}
                {order.paymentStatus === 'VERIFICATION_PENDING' && (
                    <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-2xl mb-6 text-left mx-2 animate-pulse">
                        <div className="flex gap-3 items-start">
                            <span className="text-2xl">⏳</span>
                            <div>
                                <h3 className="text-yellow-400 font-bold font-hindi text-sm mb-1">पेमेंट अप्रूवल लंबित है</h3>
                                <p className="text-yellow-100/80 text-xs font-hindi leading-relaxed">
                                    सूचना: 24 घंटे के भीतर पेमेंट अप्रूवल होने के बाद आर्डर आगे बढ़ाया जाएगा। कृपया प्रतीक्षा करें।
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Digital Downloads Section - ADVANCED UI */}
                {order.paymentStatus === 'COMPLETED' && digitalItems.length > 0 && (
                    <div className="bg-gradient-to-b from-blue-900/40 to-blue-950/40 rounded-[2rem] border border-blue-500/30 p-6 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                        {/* Glow Effect */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-2xl animate-bounce">🎉</span>
                            <h3 className="text-xl font-hindi font-black text-blue-200 uppercase tracking-tight">आपकी ई-बुक्स तैयार हैं!</h3>
                        </div>

                        <div className="space-y-4">
                            {digitalItems.map((item, idx) => (
                                <div key={idx} className="bg-black/40 p-5 rounded-2xl flex flex-col gap-4 items-center border border-blue-500/20 hover:border-blue-400/50 transition-all group">
                                    <div className="text-center">
                                        <p className="text-white font-hindi font-bold text-lg leading-tight mb-1">{item.name}</p>
                                        <p className="text-[10px] text-blue-300 font-black uppercase">Instant Access • PDF Format</p>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-center gap-3 w-full">
                                        <button 
                                            onClick={() => handleDownload(item)}
                                            className="flex-grow py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest border-b-4 border-blue-800 flex items-center justify-center gap-2 group-hover:shadow-blue-500/40"
                                        >
                                            📥 DOWNLOAD PDF
                                        </button>
                                        {item.googleDriveLink && (
                                            <button 
                                                onClick={() => copyLink(item.googleDriveLink!)}
                                                className="py-3 px-4 bg-white/5 border border-white/20 text-blue-200 rounded-xl hover:bg-white/10 transition-all"
                                                title="Copy Link"
                                            >
                                                🔗
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, ((item.downloadCount || 0) / 5) * 100)}%` }}></div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">
                                        {item.downloadCount || 0}/5 Downloads Used
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-blue-200/60 mt-4 font-hindi text-center">
                            नोट: यदि डाउनलोड शुरू नहीं होता है, तो '🔗' बटन दबाकर लिंक कॉपी करें और ब्राउज़र में खोलें।
                        </p>
                    </div>
                )}

                {/* Physical Order Tracker */}
                {physicalItems.length > 0 && (
                    <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-4 mb-8">
                         <h3 className="text-sm font-hindi font-black text-white mb-2 uppercase tracking-widest">शिपिंग स्थिति</h3>
                         <OrderTracker status={order.status} />
                         
                         {order.trackingId && (
                            <div className="mt-4 bg-green-600/10 p-6 rounded-3xl border border-green-500/30 animate-fade-in">
                                <p className="text-green-400 font-hindi font-bold mb-4">आपका सामान निकल चुका है! 📦</p>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[9px] text-gray-500 uppercase font-black">Carrier: {order.carrier}</span>
                                    <span className="text-base font-mono text-white bg-white/5 px-6 py-2 rounded-full border border-white/10 mb-4 shadow-inner">ID: {order.trackingId}</span>
                                    <a 
                                        href={`https://www.google.com/search?q=${encodeURIComponent(order.carrier + ' tracking ' + order.trackingId)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase"
                                    >
                                        ट्रैक करें 🚚
                                    </a>
                                </div>
                            </div>
                         )}
                    </div>
                )}

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-left">
                    <h3 className="text-[10px] font-black text-purple-400 mb-4 uppercase tracking-[0.2em]">Summary</h3>
                    <div className="space-y-3 mb-6">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-400 truncate max-w-[200px] font-hindi">{item.name} x{item.quantity}</span>
                                <span className="text-white font-black">₹{((item.mrp - (item.mrp * item.discountPercentage / 100)) * item.quantity).toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                    {/* Display Address & Landmark Info */}
                    <div className="mb-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-300 font-bold mb-1">Shipping Details:</p>
                        <p className="text-xs text-gray-400">{order.customer.address}</p>
                        {order.customer.landmark && <p className="text-xs text-gray-400">Landmark: {order.customer.landmark}</p>}
                        <p className="text-xs text-gray-400">{order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
                        <p className="text-xs text-gray-400">{order.customer.country}</p>
                        <p className="text-xs text-blue-400 mt-1">📞 {order.customer.phone}</p>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                        <span className="text-purple-300 font-black uppercase text-xs">Total Amount</span>
                        <span className="text-3xl font-black text-pink-500">₹{order.total.toFixed(0)}</span>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                    <Link to="/home" className="px-8 py-4 bg-white/5 border border-white/20 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-[10px] tracking-widest">वापस होम पर जाएं</Link>
                    <a href={`https://wa.me/919305968628?text=${encodeURIComponent(`नमस्ते, मुझे मेरे ऑर्डर #${order.id.slice(-8)} के बारे में सहायता चाहिए।`)}`} className="text-[10px] text-purple-400 font-bold uppercase underline">मदद चाहिए? व्हाट्सएप करें</a>
                </div>
            </Card>
        </div>
    );
};

export default OrderConfirmationScreen;
