
import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import { useAppContext } from '../App';

interface NotificationBellProps {
    notifications: Notification[];
    onOpen: () => void;
    onClear: () => void;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

const timeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onOpen, onClear, isOpen: externalIsOpen, onToggle }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const { t } = useAppContext();
    const unreadCount = notifications.filter(n => !n.read).length;
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isPanelOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    const togglePanel = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = !isPanelOpen;
        if (newState) {
            onOpen(); // Mark as read when opening
        }
        
        if (onToggle) {
            onToggle(newState);
        } else {
            setInternalIsOpen(newState);
        }
    };

    const closePanel = () => {
        if (onToggle) {
            onToggle(false);
        } else {
            setInternalIsOpen(false);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only close if the click is outside the panel AND outside the button
            if (
                panelRef.current && 
                !panelRef.current.contains(event.target as Node) && 
                buttonRef.current && 
                !buttonRef.current.contains(event.target as Node)
            ) {
                closePanel();
            }
        };

        if (isPanelOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isPanelOpen, onToggle]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={togglePanel}
                className="relative p-1 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-black">{unreadCount}</span>
                )}
            </button>

            {/* Notification Panel */}
            <div 
                ref={panelRef}
                className={`fixed top-12 right-2 w-[calc(100vw-1rem)] max-w-sm bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-[100] transition-all duration-300 transform origin-top-right ${isPanelOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'}`}
                style={{ maxHeight: '80vh', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-orange-400">🔔</span>
                        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Alerts</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {notifications.length > 0 && (
                             <button onClick={onClear} className="text-[10px] text-orange-300 hover:text-white font-bold uppercase underline">Clear All</button>
                        )}
                        <button 
                            onClick={closePanel} 
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/20 transition-colors"
                        >
                            <span className="text-xl leading-none">&times;</span>
                        </button>
                    </div>
                </div>
                
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <p className="text-orange-200 font-hindi">कोई नया नोटिफिकेशन नहीं है।</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className="flex gap-3 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 text-left transition-colors">
                                <div className="w-10 h-10 rounded-full bg-black/40 flex-shrink-0 flex items-center justify-center text-xl border border-white/10">{n.icon}</div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-white text-sm leading-tight mb-1">{t(n.title as any)}</p>
                                    <p className="text-xs text-orange-200 leading-snug line-clamp-3">{n.message.startsWith('आपकी') ? n.message : t(n.message as any)}</p>
                                    <p className="text-[9px] text-white/40 mt-2 font-mono uppercase tracking-tighter">{timeSince(n.timestamp)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;
