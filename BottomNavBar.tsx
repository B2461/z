
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

const HomeIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const SupportIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const SettingsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ProfileIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const PremiumIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-8 w-8 transition-all duration-500 ${isActive ? 'text-black' : 'text-orange-400'}`} 
        viewBox="0 0 24 24" 
        fill={isActive ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

interface BottomNavBarProps {
    cartItemCount: number;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ cartItemCount }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, t, isAuthenticated, showAuth, currentUser } = useAppContext();
    
    const handleProtectedLink = (path: string) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            showAuth(() => navigate(path));
        }
    };

    const activeIconClass = "bg-yellow-400 text-black rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.6)] transform scale-105 transition-all duration-300";
    const inactiveIconClass = "text-white/70 hover:text-white transition-colors duration-300";

    // Special styling for Premium Icon
    const premiumActive = location.pathname.startsWith('/premium');
    const premiumClass = `relative flex flex-col items-center justify-center gap-1 w-16 h-full p-1 -mt-6 mb-2 rounded-full transition-all duration-300 ${premiumActive ? activeIconClass : 'bg-gray-900 border-2 border-orange-500/50 shadow-lg shadow-orange-900/30'}`;

    return (
        <nav className="fixed bottom-4 left-0 right-0 max-w-md mx-auto bg-gradient-to-r from-purple-900 via-black to-orange-900 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.5)] border border-orange-700/50 z-40">
            <div className="flex justify-around items-center h-12">
                {/* Home */}
                <Link to="/" className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full p-1 ${(location.pathname === '/' || location.pathname === '/store') ? activeIconClass : inactiveIconClass}`}>
                    <HomeIcon isActive={location.pathname === '/' || location.pathname === '/store'} />
                    <span className="text-[10px] font-bold truncate max-w-[60px]">{language === 'hi' ? 'होम' : 'Home'}</span>
                </Link>

                {/* Support - Gated */}
                <button onClick={() => handleProtectedLink('/support')} className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full p-1 ${location.pathname.startsWith('/support') ? activeIconClass : inactiveIconClass}`}>
                    <SupportIcon isActive={location.pathname.startsWith('/support')} />
                    <span className="text-[10px] font-bold truncate max-w-[60px]">{t('support_and_help')}</span>
                </button>

                {/* PREMIUM - Center - Gated */}
                <button onClick={() => handleProtectedLink('/premium')} className={premiumClass}>
                    <PremiumIcon isActive={premiumActive} />
                    <span className={`text-[10px] font-bold truncate max-w-[60px] ${premiumActive ? 'text-black' : 'text-orange-400'}`}>Premium</span>
                </button>

                {/* Settings - Moved here */}
                <Link to="/settings" className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full p-1 ${location.pathname.startsWith('/settings') ? activeIconClass : inactiveIconClass}`}>
                    <SettingsIcon isActive={location.pathname.startsWith('/settings')} />
                    <span className="text-[10px] font-bold truncate max-w-[60px]">{t('settings')}</span>
                </Link>

                {/* Profile - Gated */}
                <button onClick={() => handleProtectedLink('/profile')} className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full p-1 ${location.pathname.startsWith('/profile') ? activeIconClass : inactiveIconClass}`}>
                    {isAuthenticated && currentUser?.profilePicture ? (
                        <div className={`w-6 h-6 rounded-full border border-current overflow-hidden`}>
                            <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <ProfileIcon isActive={location.pathname.startsWith('/profile')} />
                    )}
                    <span className="text-[10px] font-bold truncate max-w-[60px]">{isAuthenticated ? (currentUser?.name?.split(' ')[0] || t('profile')) : t('login')}</span>
                </button>
            </div>
        </nav>
    );
};

export default BottomNavBar;
