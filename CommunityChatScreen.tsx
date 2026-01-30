
import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
// Fix: ChatMessage is now available in types.ts
import { ChatMessage, UserProfile } from '../types';
import { useAppContext } from '../App';
import { 
    subscribeToCommunityMessages, 
    sendCommunityMessage, 
    subscribeToAllUsers, 
    updateUserOnlineStatus,
    syncUserLocation
} from '../services/firebaseService';

const CommunityChatScreen: React.FC = () => {
    const { currentUser, isAuthenticated, showAuth, isPremiumActive, incrementChatCount, updateProfile } = useAppContext() as any;
    const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null); 
    const [isSending, setIsSending] = useState(false);
    
    // Location States
    const [currentFilter, setCurrentFilter] = useState<'Global' | 'Nearby' | 'Region'>('Global');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [manualCity, setManualCity] = useState('');
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const MAX_FREE_MESSAGES = 10;
    const messagesSent = currentUser?.chatMessagesSent || 0;
    const isLimitReached = !isPremiumActive && messagesSent >= MAX_FREE_MESSAGES;

    const HINDI_HEARTLAND_STATES = ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Rajasthan', 'Delhi', 'Haryana', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand'];

    useEffect(() => {
        if (isAuthenticated && currentUser?.uid) {
            updateUserOnlineStatus(currentUser.uid, true);
            const handleUnload = () => updateUserOnlineStatus(currentUser.uid!, false);
            window.addEventListener('beforeunload', handleUnload);
            return () => {
                updateUserOnlineStatus(currentUser.uid!, false);
                window.removeEventListener('beforeunload', handleUnload);
            };
        }
    }, [isAuthenticated, currentUser?.uid]);

    useEffect(() => {
        const unsubscribeUsers = subscribeToAllUsers((syncedUsers) => setUsers(syncedUsers));
        const unsubscribeMsgs = subscribeToCommunityMessages((syncedMessages) => {
            setAllMessages(syncedMessages);
        });
        return () => {
            unsubscribeUsers();
            unsubscribeMsgs();
        };
    }, []);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    };

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const city = data.address.city || data.address.town || data.address.village || 'Unknown';
                    const state = data.address.state || 'India';
                    
                    const updates = { city, state, lat: latitude, lng: longitude };
                    updateProfile(updates);
                    if (currentUser?.uid) await syncUserLocation(currentUser.uid, updates);
                    setShowLocationPicker(false);
                } catch (e) {
                    alert("लोकेशन सिंक विफल।");
                }
            }, () => alert("कृपया GPS अनुमति दें।"));
        }
    };

    const handleSaveManualLocation = async () => {
        if (!manualCity.trim()) return;
        const updates = { city: manualCity.trim(), state: 'India' };
        updateProfile(updates);
        if (currentUser?.uid) await syncUserLocation(currentUser.uid, updates);
        setShowLocationPicker(false);
        setManualCity('');
    };

    const filteredUsers = useMemo(() => {
        let list = users.filter(u => u.uid !== currentUser?.uid);
        if (searchQuery) {
            list = list.filter(u => 
                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                u.city?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (currentFilter === 'Nearby' && currentUser?.lat && currentUser?.lng) {
            return list.filter(u => u.lat && u.lng && getDistance(currentUser.lat!, currentUser.lng!, u.lat!, u.lng!) < 150);
        }
        if (currentFilter === 'Region') {
            return list.filter(u => u.state && HINDI_HEARTLAND_STATES.includes(u.state));
        }
        return list;
    }, [users, currentFilter, currentUser, searchQuery]);

    const displayMessages = useMemo(() => {
        const myUid = currentUser?.uid;
        if (!myUid) return allMessages.filter(m => !m.recipientUid).reverse();

        if (activeRecipient) {
            return allMessages.filter(m => 
                (m.senderUid === myUid && m.recipientUid === activeRecipient.uid) || 
                (m.senderUid === activeRecipient.uid && m.recipientUid === myUid)
            ).reverse();
        }
        return allMessages.filter(m => !m.recipientUid || m.recipientUid === "").reverse();
    }, [allMessages, activeRecipient, currentUser?.uid]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayMessages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || isSending) return;

        // Fix: Improved Authentication Check
        if (!isAuthenticated || !currentUser?.uid) { 
            showAuth(); 
            return; 
        }

        if (isLimitReached) { 
            alert("फ्री मैसेज लिमिट पूरी हुई। कृपया प्रीमियम लें।"); 
            return; 
        }

        setIsSending(true);
        try {
            await sendCommunityMessage({
                senderUid: currentUser.uid,
                senderName: currentUser.name || 'User',
                senderEmail: currentUser.email || '',
                senderPhoto: currentUser.profilePicture || '',
                recipientUid: activeRecipient?.uid || "", 
                text: text,
                category: 'General',
                senderLocation: currentUser.city ? `${currentUser.city}, ${currentUser.state}` : 'India'
            });
            incrementChatCount();
            setNewMessage('');
        } catch (err: any) {
            console.error("Send failed:", err);
            alert(`संदेश भेजने में विफल: ${err.message || 'नेटवर्क चेक करें'}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="animate-fade-in max-w-4xl mx-auto h-[85vh] flex flex-col p-0 overflow-hidden relative border-purple-500/30 shadow-2xl">
            
            {showLocationPicker && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-yellow-500/30 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl">
                        <h3 className="text-2xl font-hindi font-bold text-white mb-6 text-center">लोकेशन सेट करें 📍</h3>
                        <button onClick={detectLocation} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold mb-6 flex items-center justify-center gap-3 active:scale-95 transition-all">
                            🎯 ऑटो-डिटेक्ट करें
                        </button>
                        <input 
                            type="text" 
                            value={manualCity} 
                            onChange={(e) => setManualCity(e.target.value)}
                            placeholder="शहर का नाम (उदा: पटना)" 
                            className="w-full bg-black/40 p-4 rounded-2xl border border-white/10 text-white outline-none mb-6 font-hindi"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleSaveManualLocation} className="flex-grow py-4 bg-yellow-400 text-black font-black rounded-2xl shadow-xl">सेव करें</button>
                            <button onClick={() => setShowLocationPicker(false)} className="px-6 py-4 bg-white/5 text-white rounded-2xl font-bold">रद्द</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col gap-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <button onClick={() => setShowLocationPicker(true)} className="flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-500/20 hover:bg-yellow-400/20 transition-all">
                        <span className="text-lg">📍</span>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-yellow-500 uppercase leading-none">Your Area</p>
                            <p className="text-xs font-bold text-white truncate max-w-[100px]">{currentUser?.city || 'Set City'}</p>
                        </div>
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-hindi font-black text-white">ग्राहक चौपाल</h2>
                        <span className="text-[8px] text-green-400 uppercase font-black">{users.filter(u => u.isOnline).length} Online</span>
                    </div>
                    <div>
                        {isPremiumActive ? (
                            <span className="text-[9px] bg-yellow-400 text-black px-3 py-1 rounded-full font-black shadow-lg">👑 VIP</span>
                        ) : (
                            <span className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black">
                                {MAX_FREE_MESSAGES - messagesSent} LEFT
                            </span>
                        )}
                    </div>
                </div>

                {/* Search Input */}
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="दोस्त या शहर खोजें..." 
                    className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-xs text-white outline-none focus:border-purple-500"
                />

                {/* Filters moved below Search Input */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['Global', 'Nearby', 'Region'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setCurrentFilter(tab as any)}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest ${currentFilter === tab ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                        >
                            {tab === 'Global' ? '🌍 INDIA' : tab === 'Nearby' ? '📍 NEARBY' : '🗣️ HINDI'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
                    <button onClick={() => setActiveRecipient(null)} className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition-all ${!activeRecipient ? 'scale-110' : 'opacity-40 grayscale'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${!activeRecipient ? 'bg-purple-600 border-purple-400 shadow-xl' : 'bg-slate-800 border-white/10'}`}>🌍</div>
                        <span className="text-[8px] text-white font-black uppercase">Public</span>
                    </button>

                    {filteredUsers.map(user => {
                        const dist = (currentUser?.lat && user.lat) ? getDistance(currentUser.lat, currentUser.lng!, user.lat, user.lng!) : null;
                        return (
                            <button key={user.uid} onClick={() => setActiveRecipient(user)} className={`flex flex-col items-center gap-1.5 flex-shrink-0 transition-all ${activeRecipient?.uid === user.uid ? 'scale-110' : 'opacity-60 grayscale'}`}>
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${activeRecipient?.uid === user.uid ? 'border-blue-400' : 'border-white/10'} bg-slate-800 flex items-center justify-center`}>
                                        {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-purple-400">{user.name?.[0]}</span>}
                                    </div>
                                    {user.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>}
                                </div>
                                <span className="text-[8px] text-white font-bold truncate w-14 text-center uppercase">{user.name?.split(' ')[0]}</span>
                                <span className="text-[7px] text-yellow-500 font-black">{dist !== null ? `${dist}km` : (user.city || 'IND')}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-black/60 custom-scrollbar">
                {displayMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <span className="text-6xl mb-4">💬</span>
                        <p className="font-hindi text-lg">चर्चा शुरू करें!</p>
                    </div>
                ) : (
                    displayMessages.map((msg) => {
                        const isOwn = msg.senderUid === currentUser?.uid;
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[85%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        {!isOwn && (
                                            <div className="w-5 h-5 rounded-full bg-purple-500/40 flex items-center justify-center text-[8px] overflow-hidden">
                                                {msg.senderPhoto ? <img src={msg.senderPhoto} className="w-full h-full object-cover" /> : msg.senderName?.[0]}
                                            </div>
                                        )}
                                        <span className="text-[9px] font-black text-purple-300 uppercase">
                                            {isOwn ? 'YOU' : msg.senderName} 
                                            <span className="text-[7px] text-gray-500 ml-2">📍 {msg.senderLocation || 'India'}</span>
                                        </span>
                                    </div>
                                    <div className={`p-3 rounded-2xl text-[14px] shadow-xl border ${isOwn ? 'bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 text-white rounded-tr-none' : 'bg-slate-800/80 border-white/10 text-white/90 rounded-tl-none'}`}>
                                        <p className="font-hindi leading-relaxed break-words">{msg.text}</p>
                                        <p className="text-[7px] mt-2 opacity-50 text-right font-mono">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-900 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={activeRecipient ? `${activeRecipient.name} को लिखें...` : "ग्रुप में लिखें..."}
                        className="flex-grow bg-black/60 p-4 rounded-2xl border border-white/10 text-white outline-none text-sm font-hindi"
                        disabled={!isAuthenticated || isSending || isLimitReached}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending || !isAuthenticated || isLimitReached}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 w-14 h-14 flex-shrink-0 rounded-2xl text-white shadow-xl active:scale-90 flex items-center justify-center border border-white/10 disabled:opacity-30"
                    >
                        {isSending ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        )}
                    </button>
                </form>
            </div>
        </Card>
    );
};

export default CommunityChatScreen;
