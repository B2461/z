
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { changeUserPassword } from '../services/firebaseService';

// Extract ProfileItem outside to prevent re-renders
const ProfileItem = ({ icon, title, desc, onClick, isDanger = false, disabled = false, isFolder = false }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0 group ${isDanger ? 'hover:bg-red-50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isFolder ? 'bg-yellow-50/50 hover:bg-yellow-100/50 border-l-4 border-l-yellow-400' : ''}`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${isDanger ? 'bg-red-100 text-red-600' : (isFolder ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-700')}`}>
                {icon}
            </div>
            <div className="text-left">
                <p className={`font-bold text-sm ${isDanger ? 'text-red-600' : 'text-gray-900'}`}>{title}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
            </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDanger ? 'text-red-300' : 'text-gray-300'} group-hover:translate-x-1 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

const ProfileScreen: React.FC<any> = () => {
    const { currentUser, logout, isPremiumActive, orders } = useAppContext() as any;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // Password Change State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Logout Modal State
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // --- PREMIUM CALCULATION LOGIC ---
    const premiumDaysLeft = useMemo(() => {
        if (!currentUser?.subscriptionExpiry) return 0;
        const now = new Date().getTime();
        const expiry = new Date(currentUser.subscriptionExpiry).getTime();
        const diff = expiry - now;
        return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
    }, [currentUser]);

    const whatsappInfo = useMemo(() => {
        if (!currentUser?.whatsappSupportExpiry) return { active: false, daysLeft: 0 };
        const now = new Date().getTime();
        const expiry = new Date(currentUser.whatsappSupportExpiry).getTime();
        const diff = expiry - now;
        const daysLeft = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
        return { active: daysLeft > 0, daysLeft };
    }, [currentUser]);

    const downloadsInfo = useMemo(() => {
        let total = currentUser?.downloadsLimit || 0;
        const used = currentUser?.downloadsConsumed || 0;
        
        if ((!total || total === 0) && currentUser?.subscriptionPlan) {
             const pName = currentUser.subscriptionPlan.toLowerCase();
             if (pName.includes('weekly')) total = 12;
             else if (pName.includes('monthly')) total = 50;
             else if (pName.includes('yearly')) total = 999999;
        }

        const isUnlimited = total > 90000; 
        const remaining = isUnlimited ? 99999 : Math.max(0, total - used);
        const percentage = isUnlimited ? 0 : (total > 0 ? Math.min(100, (used / total) * 100) : 0);
        
        return { total, used, remaining, percentage, isUnlimited };
    }, [currentUser]);

    // --- MONTHLY ANALYTICS LOGIC ---
    const monthlyStats = useMemo(() => {
        if (!currentUser || !orders) return [];
        
        // Filter orders for current user by email
        const userOrders = orders.filter((o: any) => o.customer.email === currentUser.email);
        
        const stats: Record<string, { totalSpent: number; orderCount: number; cancelledCount: number; monthName: string; year: number; monthIndex: number }> = {};

        userOrders.forEach((order: any) => {
            const date = new Date(order.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`; 
            
            if (!stats[monthKey]) {
                stats[monthKey] = {
                    totalSpent: 0,
                    orderCount: 0,
                    cancelledCount: 0,
                    monthName: date.toLocaleString('hi-IN', { month: 'long' }),
                    year: date.getFullYear(),
                    monthIndex: date.getMonth()
                };
            }

            if (order.status !== 'Cancelled') {
                stats[monthKey].orderCount += 1;
                if (order.status === 'Completed' || order.status === 'Delivered' || order.paymentStatus === 'COMPLETED') {
                    stats[monthKey].totalSpent += order.total;
                }
            } else {
                stats[monthKey].cancelledCount += 1;
            }
        });

        return Object.values(stats).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.monthIndex - a.monthIndex;
        });
    }, [orders, currentUser]);

    if (!currentUser) return null;

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        
        if (!currentPassword || !newPassword) {
            setPasswordError("कृपया दोनों पासवर्ड भरें।");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।");
            return;
        }

        setIsLoading(true);
        try {
            await changeUserPassword(currentPassword, newPassword);
            alert("✅ पासवर्ड सफलतापूर्वक बदल दिया गया!");
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            console.error("Password change error:", error);
            if (error.code === 'auth/wrong-password' || error.message.includes('credential')) {
                setPasswordError("पुराना पासवर्ड गलत है। कृपया पुनः प्रयास करें।");
            } else {
                setPasswordError("पासवर्ड बदलने में विफल। नेटवर्क चेक करें।");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        logout();
    };

    return (
        <div className="animate-fade-in max-w-lg mx-auto min-h-screen pb-32 text-left px-4 relative">
            <header className="py-6 flex items-center gap-4">
                <button onClick={() => navigate('/home')} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-3xl font-black text-white">My Account</h2>
            </header>

            {/* Profile Card */}
            <div className="flex flex-col gap-4 mb-6 bg-gradient-to-br from-gray-900 to-black p-5 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-5 z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                            {currentUser.profilePicture ? (
                                <img src={currentUser.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <span className="text-3xl font-black text-white">{currentUser.name?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight">{currentUser.name || 'User Name'}</h3>
                        <p className="text-gray-400 text-xs mb-2">{currentUser.email}</p>
                        <span className="bg-green-500/20 text-green-300 text-[10px] font-black px-2 py-1 rounded border border-green-500/30 uppercase tracking-wider flex items-center gap-1 w-fit">
                            Cloud Synced ✅
                        </span>
                    </div>
                </div>
            </div>

            {/* NEW: DETAILED SUBSCRIPTION STATS CARD */}
            {isPremiumActive ? (
                <div className="mb-6 p-6 rounded-[2rem] border-2 border-yellow-500/50 bg-[#121212] relative overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <div className="absolute top-0 right-0 px-4 py-2 bg-yellow-500 text-black text-[10px] font-black rounded-bl-xl uppercase tracking-widest">
                        {currentUser.subscriptionPlan || 'Premium'}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📊</span>
                        <h3 className="text-lg font-hindi font-black text-white uppercase">प्लान स्टेटस</h3>
                    </div>

                    {/* Progress Bar for Downloads */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 font-hindi">
                            <span>उपयोग (Used): <span className="text-white">{downloadsInfo.used}</span></span>
                            <span>कुल सीमा: <span className="text-white">{downloadsInfo.isUnlimited ? 'Unlimited' : downloadsInfo.total}</span></span>
                        </div>
                        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000" 
                                style={{ width: `${downloadsInfo.percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-[10px] text-yellow-400 mt-1 font-black uppercase tracking-widest">
                            {downloadsInfo.isUnlimited ? 'UNLIMITED ACCESS' : `${downloadsInfo.percentage.toFixed(0)}% Consumed`}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-gray-400 font-hindi uppercase tracking-widest">शेष डाउनलोड</p>
                            <p className="text-2xl font-black text-green-400 mt-1">
                                {downloadsInfo.isUnlimited ? '∞' : downloadsInfo.remaining}
                            </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                            <p className="text-[10px] text-gray-400 font-hindi uppercase tracking-widest">शेष दिन</p>
                            <p className="text-2xl font-black text-blue-400 mt-1">{premiumDaysLeft} Days</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 p-6 rounded-[2rem] border border-white/10 bg-gradient-to-r from-gray-900 to-black relative overflow-hidden">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-hindi font-bold text-white mb-1">फ्री प्लान</h3>
                            <p className="text-xs text-gray-400">लिमिटेड फीचर्स</p>
                        </div>
                        <button onClick={() => navigate('/premium')} className="px-6 py-3 bg-yellow-500 text-black font-black rounded-xl text-xs uppercase shadow-lg hover:scale-105 transition-transform">
                            Upgrade 👑
                        </button>
                    </div>
                </div>
            )}

            {/* WhatsApp Support Status Card */}
            {whatsappInfo.active && (
                <div className="mb-8 p-5 rounded-[2rem] border border-emerald-500/50 bg-[#0a2015] relative overflow-hidden shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl text-black">
                            💬
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">WhatsApp Support</h3>
                            <p className="text-xs text-emerald-400 font-bold">Active Plan</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black">शेष दिन</p>
                        <p className="text-xl font-black text-white">{whatsappInfo.daysLeft} Days</p>
                    </div>
                </div>
            )}

            {/* CLOUD DATA SECTION: Reordered and Updated */}
            <div className="space-y-8">
                <div>
                    <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Cloud Data (Real-time)
                    </h4>
                    
                    <div className="space-y-4">
                        {/* 1. Monthly Report */}
                        {monthlyStats.length > 0 && (
                            <div className="animate-slide-in pl-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">📊</span>
                                    <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                                        मासिक रिपोर्ट (Shopping Analytics)
                                    </h4>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
                                    {monthlyStats.map((stat, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-40 bg-[#121212] border border-white/10 p-4 rounded-2xl shadow-lg flex flex-col justify-between h-32 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full"></div>
                                            <div>
                                                <p className="text-xs font-black text-gray-500 uppercase">{stat.year}</p>
                                                <p className="text-lg font-hindi font-bold text-white capitalize">{stat.monthName}</p>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-2xl font-black text-green-400">₹{stat.totalSpent}</p>
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-gray-400">{stat.orderCount} Orders</p>
                                                        {stat.cancelledCount > 0 && <p className="text-[8px] text-red-400">{stat.cancelledCount} Cancelled</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. My Orders (इतिहास) */}
                        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/5">
                            <ProfileItem 
                                icon="🛒"
                                title="My Orders (ऑर्डर्स)"
                                desc="आपके पिछले ऑर्डर्स और स्टेटस (History)"
                                onClick={() => navigate('/orders')}
                            />
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div>
                    <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-3 ml-2">Account Settings</h4>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                        <ProfileItem 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            title="Edit Profile"
                            desc="Change Name, Phone, Address"
                            onClick={() => navigate('/profile/edit')}
                        />
                        <ProfileItem 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            title="Change Password"
                            desc="Update password immediately"
                            onClick={() => setShowPasswordForm(true)}
                        />
                        <ProfileItem 
                            icon="📁"
                            title="सवाल जवाब (Q&A)"
                            desc="Help Links Folder"
                            onClick={() => navigate('/faq')}
                            isFolder={true}
                        />
                    </div>
                </div>

                {/* App Info */}
                <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Support & Info</h4>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                        <ProfileItem 
                            icon="🛡️"
                            title="Privacy Policy"
                            desc="How we handle your data"
                            onClick={() => navigate('/privacy')}
                        />
                        <ProfileItem 
                            icon="❓"
                            title="Help & Support"
                            desc="FAQs and Contact Us"
                            onClick={() => navigate('/support')}
                        />
                        <ProfileItem 
                            icon="🚪"
                            title="Logout"
                            desc="Sign out from this device"
                            onClick={() => setShowLogoutModal(true)}
                            isDanger={true}
                        />
                    </div>
                </div>
            </div>
            
            <p className="text-center text-[10px] text-gray-600 mt-8 font-mono">
                App Version 9.2.4 • Secure Firebase Connection
            </p>

            {/* Custom Change Password Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
                        <button onClick={() => setShowPasswordForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
                        
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            🔑
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 text-center">पासवर्ड बदलें</h3>
                        <p className="text-gray-400 text-xs text-center mb-6">सुरक्षा के लिए कृपया अपना पुराना पासवर्ड सत्यापित करें।</p>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">पुराना पासवर्ड (Old Password)</label>
                                <input 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="अपना पुराना पासवर्ड डालें"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">नया पासवर्ड (New Password)</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="नया पासवर्ड सेट करें"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            {passwordError && (
                                <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded">{passwordError}</p>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Update...' : 'Confirm Update ✅'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal for Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            🚪
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">लॉगआउट करें?</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            क्या आप वाकई इस डिवाइस से लॉगआउट करना चाहते हैं?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                नहीं
                            </button>
                            <button 
                                onClick={handleLogoutConfirm}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg"
                            >
                                हाँ, लॉगआउट करें
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
