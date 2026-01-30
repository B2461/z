
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface OrderHistoryScreenProps {
    orders: Order[];
}

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ orders }) => {
    const { isAuthenticated, currentUser, showAuth, t, isPremiumActive } = useAppContext() as any;
    const [activeTab, setActiveTab] = useState<'all' | 'digital'>('all');
    const [showHistory, setShowHistory] = useState(false);

    const daysLeft = useMemo(() => {
        if (!currentUser?.subscriptionExpiry) return 0;
        const now = new Date();
        const expiry = new Date(currentUser.subscriptionExpiry);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [currentUser]);

    const whatsappDaysLeft = useMemo(() => {
        if (!currentUser?.whatsappSupportExpiry) return 0;
        const now = new Date();
        const expiry = new Date(currentUser.whatsappSupportExpiry);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [currentUser]);

    if (!isAuthenticated || !currentUser) {
        return (
            <Card className="animate-fade-in max-w-2xl mx-auto text-center">
                <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
                <h2 className="text-3xl font-hindi font-bold mb-4">{t('my_orders')}</h2>
                <button onClick={() => showAuth()} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full text-lg">लॉगिन करें</button>
            </Card>
        );
    }

    const normalizePhone = (phone: string | undefined) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); 
        return digits.slice(-10);
    };

    const userPhoneNormalized = normalizePhone(currentUser.phone);
    const userEmailLower = currentUser.email?.toLowerCase().trim();

    // 1. Get All Orders for User (Cloud Synced via App.tsx)
    const userOrders = [...orders]
        .filter(order => {
            const orderPhoneNormalized = normalizePhone(order.customer.phone);
            const phoneMatch = userPhoneNormalized && orderPhoneNormalized && userPhoneNormalized === orderPhoneNormalized;
            const orderEmailLower = order.customer.email?.toLowerCase().trim();
            const emailMatch = userEmailLower && orderEmailLower && userEmailLower === orderEmailLower;
            // Strict email check primary, phone fallback
            return emailMatch || phoneMatch; 
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 2. Filter Active Only (Hide Completed/Cancelled/Delivered/Refunded from main view)
    const runningOrders = userOrders.filter(o => 
        o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Delivered' && o.status !== 'Refunded'
    );

    // 3. Filter History (Completed/Cancelled/Delivered/Refunded)
    const historyOrders = userOrders.filter(o => 
        o.status === 'Completed' || o.status === 'Cancelled' || o.status === 'Delivered' || o.status === 'Refunded'
    );

    // Determine what to display based on state
    const displayList = activeTab === 'digital' 
        ? userOrders.filter(order => order.items.some(item => item.productType === 'DIGITAL'))
        : (showHistory ? historyOrders : runningOrders);

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-32">
            <div className="flex items-center gap-4 mb-4">
                <Link to="/profile" className="text-purple-300 hover:text-white transition flex items-center gap-1 font-bold">&larr; वापस</Link>
                <h2 className="text-2xl font-hindi font-bold text-white uppercase tracking-wider">मेरे ऑर्डर और प्लान</h2>
            </div>

            {/* Subscriptions Status Section */}
            <div className="space-y-4">
                {isPremiumActive && (
                    <div className="relative overflow-hidden group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 rounded-3xl blur opacity-30 animate-pulse"></div>
                        <div className="relative bg-black/60 backdrop-blur-xl border border-yellow-500/50 rounded-3xl p-6 shadow-2xl">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-600 rounded-full flex items-center justify-center text-4xl shadow-xl saffron-glow-slow">👑</div>
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="text-2xl font-hindi font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 uppercase">VIP PREMIUM ACTIVE</h3>
                                    <p className="text-yellow-100/70 text-xs font-bold uppercase tracking-widest">{currentUser?.subscriptionPlan}</p>
                                    <div className="flex gap-4 mt-4 justify-center sm:justify-start">
                                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10"><p className="text-[8px] text-gray-400 uppercase">DAYS LEFT</p><p className="text-sm font-bold text-white">{daysLeft} Days</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {whatsappDaysLeft > 0 && (
                    <div className="relative overflow-hidden group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-green-600 rounded-3xl blur opacity-30"></div>
                        <div className="relative bg-black/60 backdrop-blur-xl border border-emerald-500/50 rounded-3xl p-5 shadow-2xl flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-2xl shadow-lg">💬</div>
                            <div>
                                <h3 className="text-lg font-hindi font-black text-emerald-300 uppercase">WhatsApp Support Active</h3>
                                <p className="text-xs text-gray-400">Expiring in <span className="text-white font-bold">{whatsappDaysLeft} days</span></p>
                            </div>
                            <Link to="/support" className="ml-auto px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl uppercase">Chat Now</Link>
                        </div>
                    </div>
                )}

                {!isPremiumActive && whatsappDaysLeft === 0 && (
                    <Link to="/premium" className="block bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-3xl border border-white/10 text-center">
                        <h3 className="text-lg font-hindi font-bold text-white">प्रीमियम सदस्य बनें! 👑</h3>
                        <p className="text-xs text-purple-200 mt-1">असीमित डाउनलोड और वीआईपी सपोर्ट के लिए अनलॉक करें।</p>
                    </Link>
                )}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 sticky top-14 z-30 backdrop-blur-md">
                <button 
                    onClick={() => { setActiveTab('all'); setShowHistory(false); }} 
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'all' && !showHistory ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    📦 रनिंग ऑर्डर्स
                </button>
                <button 
                    onClick={() => { setActiveTab('all'); setShowHistory(true); }} 
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${showHistory ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    📜 इतिहास
                </button>
                <button 
                    onClick={() => { setActiveTab('digital'); setShowHistory(false); }} 
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'digital' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    📚 E-Books
                </button>
            </div>

            <div className="space-y-4">
                {displayList.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-purple-200 font-hindi">
                            {activeTab === 'digital' 
                                ? 'आपकी डिजिटल लाइब्रेरी खाली है।' 
                                : (showHistory ? 'आपका कोई पुराना शॉपिंग इतिहास नहीं है।' : 'वर्तमान में कोई रनिंग ऑर्डर नहीं है।')}
                        </p>
                    </div>
                ) : (
                    displayList.map(order => (
                        <div key={order.id} className="relative animate-fade-in">
                            <Link to={`/orders/${order.id}`} className={`block text-left bg-white/5 backdrop-blur-sm rounded-3xl border p-6 group transition-all active:scale-[0.98] ${order.items.some(i => i.productType === 'DIGITAL') ? 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-purple-400 text-[10px] font-mono mb-1 uppercase tracking-tighter">ID: #{order.id.slice(-8).toUpperCase()}</p>
                                        <p className="text-white text-sm font-bold">{new Date(order.date).toLocaleDateString('hi-IN', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${order.status === 'Shipped' ? 'bg-orange-600/20 text-orange-400 border-orange-500/40' : (order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-600/20 text-green-400 border-green-500/40' : order.status === 'Refunded' ? 'bg-pink-900/60 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : order.status === 'Cancelled' ? 'bg-red-600/20 text-red-400 border-red-500/40' : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/40')}`}>
                                        {order.status === 'Refunded' ? 'Refunded (Payment Returned)' : order.status}
                                    </div>
                                </div>

                                {/* Tracking Info Logic */}
                                {order.trackingId && order.status !== 'Delivered' && order.status !== 'Completed' && order.status !== 'Refunded' && (
                                    <div className="bg-green-600/10 border border-green-500/30 rounded-2xl p-4 flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl animate-bounce">🚚</span>
                                            <div>
                                                <p className="text-[9px] text-green-400 font-black uppercase tracking-widest">Shipment Live</p>
                                                <p className="text-xs text-white font-bold">{order.carrier || 'Courier'}</p>
                                            </div>
                                        </div>
                                        <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Track &rarr;</div>
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-gray-400 font-hindi truncate max-w-[200px] flex items-center gap-1">
                                                {item.productType === 'DIGITAL' && <span className="text-xs">📂</span>} {item.name}
                                            </span>
                                            <span className="text-purple-400 font-bold">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                    <span className="text-[10px] text-gray-500 font-black uppercase">{order.paymentMethod}</span>
                                    <div className="flex items-center gap-3">
                                        {activeTab === 'digital' && (
                                            order.paymentStatus === 'COMPLETED' ? (
                                                <span className="text-[10px] text-blue-400 font-bold uppercase animate-pulse flex items-center gap-1">
                                                    Download Now 📥
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-yellow-500 font-bold uppercase flex items-center gap-1">
                                                    ⏳ Approval Pending
                                                </span>
                                            )
                                        )}
                                        <p className="text-xl font-black text-pink-500">₹{order.total.toFixed(0)}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderHistoryScreen;
