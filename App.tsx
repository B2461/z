
import React, { useState, useCallback, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { DivinationType, CartItem, Order, CustomerDetails, Product, Notification, VerificationRequest, SupportTicket, SocialMediaPost, SubscriptionPlan, UserProfile, SavedReading } from '../types';
import { products as initialProducts } from '../data/products';
import { ebooks } from '../data/ebooks';
import { toolCategories, showcaseTools } from '../data/tools';
import { 
    subscribeToAuthChanges, loginUser, registerUser, logoutUser, getFirestoreProducts, 
    saveUserProfile, updateFirestoreOrder, deleteFirestoreVerification,
    addVerificationRequest, addSupportTicket, addSocialPost, deleteSocialPost,
    updateSupportTicketStatus, getUserProfile, subscribeToUserReadings, deleteSavedReading,
    subscribeToUserOrders, getUserByEmail, subscribeToUserProfile, getUserByPhone,
    subscribeToProducts
} from '../services/firebaseService';

// Components
import WelcomeScreen from './components/WelcomeScreen';
import SelectionScreen from './components/SelectionScreen';
import SettingsScreen from './components/SettingsScreen';
import PujanSamagriStore from './components/PujanSamagriStore';
import ProductDetailScreen from './components/ProductDetailScreen';
import ShoppingCartScreen from './components/ShoppingCartScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderConfirmationScreen from './components/OrderConfirmationScreen';
import NotificationBell from './components/NotificationBell';
import AdminScreen from './components/AdminScreen';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import ProfileScreen from './components/ProfileScreen';
import BottomNavBar from './components/BottomNavBar';
import LoginScreen from './components/LoginScreen';
import OrderHistoryScreen from './components/OrderHistoryScreen';
import SupportTicketScreen from './components/SupportTicketScreen';
import SearchModal from './components/SearchModal';
import PremiumScreen from './components/PremiumScreen';
import SubscriptionPaymentScreen from './components/SubscriptionPaymentScreen';
import SubscriptionConfirmationScreen from './components/SubscriptionConfirmationScreen';
import WishlistScreen from './components/WishlistScreen';
import DivinationScreen from './components/DivinationScreen';
import CommunityChatScreen from './components/CommunityChatScreen';
import AccountSettingsScreen from './components/AccountSettingsScreen';
import FAQScreen from './components/FAQScreen';
import PastReadingsScreen from './components/PastReadingsScreen';

// --- Global Icons ---
function CartIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function OrderIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isActive ? 'text-black' : 'text-current'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
    );
}

function SearchIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

function HeartIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isActive ? 'text-pink-500 fill-pink-500' : 'text-current'}`} fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );
}

const translations = {
  hi: {
    terms_and_conditions: 'नियम और शर्तें',
    privacy_policy: 'गोपनीयता नीति',
    copyright: `© ${new Date().getFullYear()} Ok-E-store. सर्वाधिकार सुरक्षित।`,
    settings: 'सेटिंग्स',
    back: 'वापस',
    my_orders: 'मेरे ऑर्डर',
    welcome_notification_title: 'आपका स्वागत है!',
    welcome_notification_message: 'Ok-E-store in स्वागत है। खरीदारी शुरू करें!',
    special_offer_title: 'विशेष पेशकश!',
    special_offer_message: 'हमारी नई पूजन सामग्री स्टोर देखें।',
    music: 'संगीत',
    admin: 'एडमिन',
    notifications: 'Alert',
    profile: 'प्रोफ़ाइल',
    cart: 'कार्ट',
    search: 'खोज',
    login: 'लॉगिन',
    wishlist: 'पसंद',
    welcome_greeting: 'Ok-E-store में आपका स्वागत है',
    welcome_subtitle: 'आध्यात्मिक और आधुनिक जीवनशैली की खरीदारी करें',
    welcome_intro: 'यह ऐप पूजन सामग्री, ई-पुस्तकें, मोबाइल एक्सेसरीज़ और बहुत कुछ खरीदने के लिए आपकी वन-स्टॉप-शॉप है।',
    start_journey: 'खरीदारी शुरू करें',
    agree_to_terms_privacy_part1: 'मैं',
    agree_to_terms_privacy_part2: 'और',
    agree_to_terms_privacy_part3: 'से सहमत हूँ।',
    select_language: 'भाषा चुनें',
    select_theme: 'थीम चुनें',
    spiritual_store: 'आध्यात्मिक स्टोर',
    shopping: 'शॉपिंग',
    admin_tools: 'एडमिन उपकरण',
    support_and_help: 'सहायता और समर्थन',
    raise_ticket: 'टिकट बनाएं',
    ticket_category: 'समस्या की श्रेणी',
    describe_issue: 'अपनी समस्या का विस्तार से वर्णन करें',
    submit_ticket: 'टिकट जमा करें',
    ticket_submitted_success_title: 'टिकट सफलतापूर्वक जमा किया गया!',
    ticket_submitted_success_message: 'हमारी टीम जल्द ही आपसे दिए गए मोबाइल नंबर पर संपर्क करेगी।',
    support_ticket_manager: 'सहायता टिकट प्रबंधक',
    ticket_status_open: 'खुला',
    ticket_status_closed: 'बंद',
    mark_as_resolved: 'हल के रूप में चिह्नित करें',
    reopen_ticket: 'टिकट फिर से खोलें',
    social_media_manager: 'सोशल मीडिया मैनेजर',
    create_new_post: 'नई पोस्ट बनाएं',
    post_content: 'पोस्ट कंटेंट',
    post_image: 'पोस्ट इमेज (वैकल्पिक)',
    platforms: 'प्लेटफार्म',
    generate_post: 'पोस्ट बनाएं',
    update_post: 'पोस्ट अपडेट करें',
    recent_posts: 'हाल की पोस्ट्स',
    premium_unlock_title: 'प्रीमियम अनलॉक करें',
    premium_unlock_subtitle: 'सभी तंत्र मंत्र यंत्र ई-बुक्स तक असीमित पहुंच प्राप्त करें।',
    premium_trial_banner_title: 'ई-बुक्स का खजाना!',
    premium_trial_banner_desc: 'अभी सब्सक्राइब करें और सभी PDF सीधे डाउनलोड करें।',
    premium_monthly_plan: 'मासिक प्लान',
    premium_yearly_plan: 'वार्षिक प्लान',
    premium_choose_plan: 'प्लान चुनें',
    payment_title: 'भुगतान',
    payment_your_name: 'आपका नाम',
    payment_your_phone: 'आपका फोन नंबर',
    payment_enter_txn_id: '12-अंकीय लेनदेन आईडी दर्ज करें',
    payment_paid_button: 'भुगतान हो गया',
    payment_verifying_title: 'सत्यापन जारी है',
    payment_verifying_subtitle: 'हम आपके भुगतान की पुष्टि कर रहे हैं।',
    payment_after_instruction: 'भुगतान के बाद, ट्रांजेक्शन आईडी दर्ज करें और स्क्रीनशॉट अपलोड करें।',
    payment_invalid_txn_id: 'अमान्य ट्रांजेक्शन आईडी।',
    sub_confirm_title: 'सदस्यता अनुरोध प्राप्त हुआ!',
    sub_confirm_message: 'आपका अनुरोध प्रक्रियाधीन है। भुगतान सत्यापित होने के बाद प्रीमियम सुविधाएं सक्रिय हो जाएंगी।',
    sub_confirm_button: 'होम पर जाएं',
  },
  en: {
    terms_and_conditions: 'Terms & Conditions',
    privacy_policy: 'Privacy Policy',
    copyright: `© ${new Date().getFullYear()} Ok-E-store. All rights reserved.`,
    settings: 'Settings',
    back: 'Back',
    my_orders: 'My Orders',
    welcome_notification_title: 'Welcome!',
    welcome_notification_message: 'Welcome to Ok-E-store. Start shopping!',
    special_offer_title: 'Special Offer!',
    special_offer_message: 'Check out our new spiritual items store.',
    music: 'Music',
    admin: 'Admin',
    notifications: 'Alert',
    profile: 'Profile',
    cart: 'Cart',
    search: 'Search',
    login: 'Login',
    wishlist: 'Wishlist',
    welcome_greeting: 'Welcome to Ok-E-store',
    welcome_subtitle: 'Shop for spiritual and modern lifestyle products',
    welcome_intro: 'This app is your one-stop-shop for spiritual items, e-books, mobile accessories, and more.',
    start_journey: 'Start Shopping',
    agree_to_terms_privacy_part1: 'I agree to the',
    agree_to_terms_privacy_part2: 'and',
    agree_to_terms_privacy_part3: '.',
    select_language: 'Select Language',
    select_theme: 'Select Theme',
    spiritual_store: 'Spiritual Store',
    shopping: 'Shopping',
    admin_tools: 'Admin Tools',
    support_and_help: 'Support & Help',
    raise_ticket: 'Raise a Ticket',
    ticket_category: 'Issue Category',
    describe_issue: 'Describe your issue in detail',
    submit_ticket: 'Submit Ticket',
    ticket_submitted_success_title: 'Ticket Submitted Successfully!',
    ticket_submitted_success_message: 'Our team will contact you shortly on the mobile number provided.',
    support_ticket_manager: 'Support Ticket Manager',
    ticket_status_open: 'Open',
    ticket_status_closed: 'Closed',
    mark_as_resolved: 'Mark as Resolved',
    reopen_ticket: 'Re-open Ticket',
    social_media_manager: 'Social Media Manager',
    create_new_post: 'Create New Post',
    post_content: 'Post Content',
    post_image: 'Post Image (optional)',
    platforms: 'Platforms',
    generate_post: 'Generate Post',
    update_post: 'Update Post',
    recent_posts: 'Recent Posts',
    premium_unlock_title: 'Unlock Premium',
    premium_unlock_subtitle: 'Get unlimited access to all Astrology and AI tools.',
    premium_trial_banner_title: 'Free Trial Available!',
    premium_trial_banner_desc: 'Sign up today and get 3 days free.',
    premium_monthly_plan: 'Monthly Plan',
    premium_yearly_plan: 'Yearly Plan',
    premium_choose_plan: 'Choose Plan',
    payment_title: 'Payment',
    payment_your_name: 'Your Name',
    payment_your_phone: 'Your Phone Number',
    payment_enter_txn_id: 'Enter 12-digit Transaction ID',
    payment_paid_button: 'I Have Paid',
    payment_verifying_title: 'Verifying Payment',
    payment_verifying_subtitle: 'We are verifying your payment details.',
    payment_after_instruction: 'After payment, enter Transaction ID and upload screenshot.',
    payment_invalid_txn_id: 'Invalid Transaction ID.',
    sub_confirm_title: 'Subscription Request Received!',
    sub_confirm_message: 'Your request is processing. Premium features will be activated once payment is verified.',
    sub_confirm_button: 'Go to Home',
  },
};

export const divinationTypeTranslations: Record<string, string> = {
    'पूजन सामग्री': 'Worship Items',
    'तंत्र मंत्र यन्त्र PDF E-book': 'Tantra Mantra Yantra PDF E-book',
    'रत्न आभूषण': 'Gems & Jewelry',
    'मोबाइल एक्सेसरीज': 'Mobile Accessories',
    'लेडीज जेंट्स एंड बेबी शूज': 'Ladies, Gents & Baby Shoes',
    'लेडीज एंड जेंट्स पर्स बैग बेल्ट चाबी का गुच्छा': 'Ladies & Gents Accessories',
    'कंप्यूटर कोर्स (बेसिक-एडवांस्ड)': 'Computer Course (Basic-Advanced)',
    'मोबाइल रिपेयरिंग कोर्स (बेसिक-एडवांस्ड)': 'Mobile Repairing Course (Basic-Advanced)',
    'एडमिन पैनल': 'Admin Panel',
    'आध्यात्मिक स्टोर': 'Spiritual Store',
    'शॉपिंग': 'Shopping',
    'स्थानीय विपणन': 'Local Marketing',
};

interface AppContextType {
    language: 'hi' | 'en';
    setLanguage: (lang: 'hi' | 'en') => void;
    theme: string;
    setTheme: (theme: string) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
    tDiv: (type: DivinationType) => { en: string; hi: string };
    isAuthenticated: boolean;
    currentUser: UserProfile | null;
    showAuth: (onSuccess?: () => void) => void;
    handleLogin: (email: string, password: string) => Promise<string | null>;
    handleSignup: (profileData: UserProfile) => Promise<boolean>;
    logout: () => void;
    deleteCurrentUser: () => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
    isPremiumActive: boolean;
    setExtendedProfiles: React.Dispatch<React.SetStateAction<Record<string, UserProfile>>>;
    extendedProfiles: Record<string, UserProfile>;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    supportTickets: SupportTicket[];
    setSupportTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
    loadProducts: () => Promise<void>;
    refreshTrigger: number;
    trackDownload: () => Promise<void>;
    incrementChatCount: () => void;
    savedReadings: SavedReading[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<'hi' | 'en'>(() => (localStorage.getItem('okFutureZoneLanguage') as 'hi' | 'en') || 'en');
    const [theme, setTheme] = useState(() => localStorage.getItem('okFutureZoneTheme') || 'cosmic');
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [extendedProfiles, setExtendedProfiles] = useState<Record<string, UserProfile>>(() => {
        try { const saved = localStorage.getItem('okFutureZoneExtendedProfiles'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
    });
    
    const [orders, setOrders] = useState<Order[]>(() => {
        try { const saved = localStorage.getItem('okFutureZoneOrders'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
        try { const saved = localStorage.getItem('okFutureZoneSupportTickets'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    
    // Initialize wishlist/cart from LocalStorage, but will overwrite with Cloud data on login
    const [wishlist, setWishlist] = useState<string[]>(() => {
        try { const saved = localStorage.getItem('okFutureZoneWishlist'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });

    const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);

    const [isAuthVisible, setIsAuthVisible] = useState(false);
    const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

    const isPremiumActive = useMemo(() => {
        if (!currentUser?.subscriptionExpiry) return false;
        return new Date(currentUser.subscriptionExpiry) > new Date();
    }, [currentUser]);

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const loadProducts = useCallback(async () => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // --- CLOUD SYNC SHIELD: Load Data on Login ---
    useEffect(() => {
        let unsubscribeReadings: (() => void) | undefined;
        let unsubscribeOrders: (() => void) | undefined;
        let unsubscribeProfile: (() => void) | undefined;

        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            if (unsubscribeProfile) { unsubscribeProfile(); unsubscribeProfile = undefined; }

            if (firebaseUser) {
                const email = firebaseUser.email || '';
                
                // Subscribe to Profile Changes Real-time
                unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (cloudProfile) => {
                    const baseProfile: UserProfile = cloudProfile || {
                        uid: firebaseUser.uid, 
                        name: firebaseUser.displayName || '',
                        email: email,
                        phone: '',
                        signupDate: new Date().toISOString(),
                    };

                    if (baseProfile.wishlist) setWishlist(baseProfile.wishlist);
                    // Cart is synced in AppComp via currentUser prop
                    
                    setCurrentUser(baseProfile);
                    setIsAuthenticated(true);
                });

                // Subscribe to Saved Readings
                unsubscribeReadings = subscribeToUserReadings(firebaseUser.uid, (readings) => {
                    setSavedReadings(readings);
                });

                // Subscribe to User Orders
                if (email) {
                    unsubscribeOrders = subscribeToUserOrders(email, (syncedOrders) => {
                        setOrders(syncedOrders);
                    });
                }

            } else {
                setCurrentUser(null);
                setIsAuthenticated(false);
                setWishlist([]);
                setSavedReadings([]);
                setOrders([]);
                localStorage.removeItem('okFutureZoneCartItems');
                localStorage.removeItem('okFutureZoneWishlist');
                
                if (unsubscribeReadings) unsubscribeReadings();
                if (unsubscribeOrders) unsubscribeOrders();
                if (unsubscribeProfile) unsubscribeProfile();
            }
        });
        return () => {
            unsubscribe();
            if (unsubscribeReadings) unsubscribeReadings();
            if (unsubscribeOrders) unsubscribeOrders();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    // --- CLOUD SYNC SHIELD: Auto-Save Wishlist ---
    const cloudWishlist = currentUser?.wishlist;
    const uid = currentUser?.uid;
    
    useEffect(() => {
        localStorage.setItem('okFutureZoneWishlist', JSON.stringify(wishlist));
        if (uid) {
            // Prevent infinite loop: Only save if changed
            const localStr = JSON.stringify(wishlist);
            const cloudStr = JSON.stringify(cloudWishlist || []);
            if (localStr !== cloudStr) {
                saveUserProfile(uid, { wishlist: wishlist });
            }
        }
    }, [wishlist, uid, cloudWishlist]);

    useEffect(() => { localStorage.setItem('okFutureZoneLanguage', language); document.documentElement.lang = language; }, [language]);
    useEffect(() => { localStorage.setItem('okFutureZoneTheme', theme); document.body.setAttribute('data-theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('okFutureZoneExtendedProfiles', JSON.stringify(extendedProfiles)); }, [extendedProfiles]);
    // Removed local storage sync for orders to rely on Firebase source of truth when logged in
    useEffect(() => { if(!isAuthenticated) localStorage.setItem('okFutureZoneOrders', JSON.stringify(orders)); }, [orders, isAuthenticated]);
    useEffect(() => { localStorage.setItem('okFutureZoneSupportTickets', JSON.stringify(supportTickets)); }, [supportTickets]);

    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        let translation = translations[language][key as keyof typeof translations.hi] || key;
        if (options) { Object.keys(options).forEach(optionKey => { translation = translation.replace(`{${optionKey}}`, String(options[optionKey])); }); }
        return translation;
    }, [language]);

    const tDiv = useCallback((type: DivinationType): { en: string; hi: string } => {
        const englishName = divinationTypeTranslations[type] || type;
        return { en: englishName, hi: type };
    }, []);

    const showAuth = (onSuccess?: () => void) => {
        setIsAuthVisible(true);
        if (onSuccess) { setAuthSuccessCallback(() => onSuccess); }
    };

    const handleLoginLogic = async (email: string, password: string): Promise<string | null> => {
        try {
            await loginUser(email, password);
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return null;
        } catch (error: any) {
            return 'लॉगिन विफल। कृपया पुनः प्रयास करें।';
        }
    };
    
    const handleSignupLogic = async (profileData: UserProfile): Promise<boolean> => {
        if (!profileData.email || !profileData.password) return false;
        try {
            await registerUser(profileData.email, profileData.password, profileData.name || '');
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return true;
        } catch (error) {
             return false;
        }
    };

    const logout = async () => {
        await logoutUser();
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
        if (currentUser?.email) {
            const newProfile = { ...currentUser, ...updatedProfile };
            setCurrentUser(newProfile);
            // setExtendedProfiles is legacy now, mostly relying on Cloud
            if (currentUser.uid) {
                await saveUserProfile(currentUser.uid, updatedProfile);
            }
        }
    };

    const deleteCurrentUser = async () => {
        if (currentUser?.email) {
            const emailToDelete = currentUser.email;
            setExtendedProfiles(prev => { const newProfiles = { ...prev }; delete newProfiles[emailToDelete]; return newProfiles; });
            await logout();
        }
    };

    const toggleWishlist = (productId: string) => {
        setWishlist(prev => {
            const newList = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
            // Cloud Sync happens in useEffect
            return newList;
        });
    };

    const trackDownload = async () => {
        if (currentUser?.uid) {
            const currentConsumed = currentUser.downloadsConsumed || 0;
            const newCount = currentConsumed + 1;
            // Cloud Persistence - This ensures it works across logins
            await saveUserProfile(currentUser.uid, { downloadsConsumed: newCount });
        }
    };

    const incrementChatCount = () => {
        if (currentUser?.uid) {
            const currentCount = currentUser.chatMessagesSent || 0;
            const updatedProfile = { ...currentUser, chatMessagesSent: currentCount + 1 };
            setCurrentUser(updatedProfile);
            saveUserProfile(currentUser.uid, { chatMessagesSent: currentCount + 1 });
        }
    };
    
    const value = useMemo(() => ({
        language, setLanguage, theme, setTheme, t, tDiv, isAuthenticated, currentUser, showAuth, logout, deleteCurrentUser, updateProfile, 
        handleLogin: handleLoginLogic, handleSignup: handleSignupLogic,
        wishlist, toggleWishlist, isPremiumActive, setExtendedProfiles, extendedProfiles, setCurrentUser,
        orders, setOrders, supportTickets, setSupportTickets, loadProducts, refreshTrigger, trackDownload, incrementChatCount,
        savedReadings
    }), [language, theme, isAuthenticated, currentUser, t, tDiv, wishlist, isPremiumActive, orders, supportTickets, loadProducts, refreshTrigger, extendedProfiles, savedReadings]);

    return (
        <AppContext.Provider value={value as any}>
            {children}
            {isAuthVisible && <LoginScreen onClose={() => setIsAuthVisible(false)} onLogin={handleLoginLogic} onSignup={handleSignupLogic} />}
        </AppContext.Provider>
    );
};

const AppComp: React.FC = () => {
    const appContext = useAppContext() as any;
    const { currentUser, t, isAuthenticated, showAuth, wishlist, orders, setOrders, refreshTrigger, setTheme, theme, setExtendedProfiles, extendedProfiles, isPremiumActive, savedReadings, setCurrentUser } = appContext;
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const [products, setProducts] = useState<Product[]>([]);
    
    // Initialize cart from LocalStorage, but overwrite from Cloud if logged in
    const [cartItems, setCartItems] = useState<CartItem[]>(() => { try { const saved = localStorage.getItem('okFutureZoneCartItems'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    
    const [notifications, setNotifications] = useState<Notification[]>(() => { try { const saved = localStorage.getItem('okFutureZoneNotifications'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [pendingVerifications, setPendingVerifications] = useState<VerificationRequest[]>(() => { try { const saved = localStorage.getItem('okFutureZonePendingVerifications'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>(() => { try { const saved = localStorage.getItem('okFutureZoneSocialMediaPosts'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    
    const defaultCategoryVisibility = { 
        product_pujan: true, 
        product_ebooks: true, 
        product_gems: true, 
        product_mobile: true, 
        product_shoes: true, 
        product_accessories: true,
        product_computer_course: true,
        product_mobile_repairing: true 
    };
    const [categoryVisibility, setCategoryVisibility] = useState<Record<string, boolean>>(() => {
        try { 
            const saved = localStorage.getItem('okFutureZoneCategoryVisibility'); 
            return saved ? { ...defaultCategoryVisibility, ...JSON.parse(saved) } : defaultCategoryVisibility;
        } catch { return defaultCategoryVisibility; }
    });
    
    const defaultSocialVisibility = { facebook: true, instagram: true, whatsapp: true, youtube: true, atoplay: true, arratai: true };
    const [socialVisibility, setSocialVisibility] = useState<Record<string, boolean>>(() => {
        try { 
            const saved = localStorage.getItem('okFutureZoneSocialVisibility_v2'); 
            return saved ? { ...defaultSocialVisibility, ...JSON.parse(saved) } : defaultSocialVisibility;
        } catch { return defaultSocialVisibility; }
    });

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<any>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Added Flash States
    const [flashCart, setFlashCart] = useState(false);
    const [flashOrder, setFlashOrder] = useState(false);
    const [flashNotif, setFlashNotif] = useState(false);
    const [flashWishlist, setFlashWishlist] = useState(false);

    // Added Previous Length Refs
    const prevCartLength = useRef(cartItems.length);
    const prevOrderLength = useRef(orders.length);
    const prevNotifLength = useRef(notifications.length);
    const prevWishlistLength = useRef(wishlist.length);

    // --- CLOUD SYNC SHIELD: Restore Cart on Login ---
    const cloudCart = currentUser?.cart;
    const isCartLoaded = useRef(false);

    // Reset sync flag on logout
    useEffect(() => {
        if (!isAuthenticated) {
            isCartLoaded.current = false;
        }
    }, [isAuthenticated]);

    // One-time Sync from Cloud on Login
    useEffect(() => {
        if (isAuthenticated && cloudCart && !isCartLoaded.current) {
            setCartItems(cloudCart);
            isCartLoaded.current = true;
        }
    }, [isAuthenticated, cloudCart]);

    // --- CLOUD SYNC SHIELD: Auto-Save Cart ---
    const uid = currentUser?.uid;
    useEffect(() => {
        localStorage.setItem('okFutureZoneCartItems', JSON.stringify(cartItems));
        if (uid) {
            // Prevent infinite loop: Only save to cloud if local state is different from cloud state
            const localCartStr = JSON.stringify(cartItems);
            const cloudCartStr = JSON.stringify(cloudCart || []);
            if (localCartStr !== cloudCartStr) {
                saveUserProfile(uid, { cart: cartItems });
            }
        }
    }, [cartItems, uid, cloudCart]);

    useEffect(() => { localStorage.setItem('okFutureZoneNotifications', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('okFutureZonePendingVerifications', JSON.stringify(pendingVerifications)); }, [pendingVerifications]);
    useEffect(() => { localStorage.setItem('okFutureZoneSocialMediaPosts', JSON.stringify(socialMediaPosts)); }, [socialMediaPosts]);
    useEffect(() => { localStorage.setItem('okFutureZoneCategoryVisibility', JSON.stringify(categoryVisibility)); }, [categoryVisibility]);
    useEffect(() => { localStorage.setItem('okFutureZoneSocialVisibility_v2', JSON.stringify(socialVisibility)); }, [socialVisibility]);

    // Added Flash Effects with visual feedback text
    useEffect(() => { 
        if (cartItems.length > prevCartLength.current) {
            setFlashCart(true); 
            setTimeout(() => setFlashCart(false), 1000);
        }
        prevCartLength.current = cartItems.length; 
    }, [cartItems]);

    useEffect(() => { 
        if (orders.length > prevOrderLength.current) {
            setFlashOrder(true); 
            setTimeout(() => setFlashOrder(false), 1000);
        }
        prevOrderLength.current = orders.length; 
    }, [orders]);

    useEffect(() => { 
        if (notifications.length > prevNotifLength.current) {
            setFlashNotif(true); 
            setTimeout(() => setFlashNotif(false), 1000);
        }
        prevNotifLength.current = notifications.length; 
    }, [notifications]);

    useEffect(() => { 
        if (wishlist.length > prevWishlistLength.current) {
            setFlashWishlist(true); 
            setTimeout(() => setFlashWishlist(false), 1000);
        }
        prevWishlistLength.current = wishlist.length; 
    }, [wishlist]);

    // NEW: Real-time Products Subscription
    useEffect(() => {
        const unsubscribe = subscribeToProducts((firestoreProds) => {
            const firestoreMap = new Map(firestoreProds.map(p => [p.id, p]));
            const staticList = [...initialProducts, ...ebooks];
            const merged = staticList.map(staticProd => {
                if (firestoreMap.has(staticProd.id)) {
                    const fsProd = firestoreMap.get(staticProd.id)!;
                    firestoreMap.delete(staticProd.id); 
                    return fsProd;
                }
                return staticProd;
            });
            // Changed order: Newest Firestore products first, then static products
            const all = [...Array.from(firestoreMap.values()), ...merged];
            setProducts(all);
            if (firestoreProds.length > 0) {
                localStorage.setItem('ok_e_store_db_has_data_flag', 'true');
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Trigger notification every 4 hours (4 * 60 * 60 * 1000 ms)
        const NOTIF_INTERVAL = 4 * 60 * 60 * 1000; 
        
        const attractiveNotifications = [
            { icon: '🔮', title: 'किस्मत का ताला खोलें! 🗝️', message: 'आज के ग्रह नक्षत्र क्या कहते हैं? अभी चेक करें।' },
            { icon: '🛍️', title: 'फ्लैश सेल अलर्ट! ⚡', message: 'सबसे सस्ते दामों पर बेस्ट गैजेट्स और एक्सेसरीज। अभी आर्डर करें।' },
            { icon: '📚', title: 'प्राचीन रहस्य उजागर 📜', message: 'गुप्त विद्याओं की दुर्लभ पुस्तकें। सीमित समय के लिए उपलब्ध।' },
            { icon: '👑', title: 'VIP अनुभव पाएं 💎', message: 'प्रीमियम मेंबर बनें और असीमित डाउनलोड का आनंद लें।' },
            { icon: '❤️', title: 'आपका सच्चा प्यार? 💕', message: 'क्या आपकी जोड़ी स्वर्ग में बनी है? कम्पेटिबिलिटी टेस्ट करें।' },
            { icon: '⚠️', title: 'सावधान! ग्रहों की चाल बदली 🪐', message: 'आने वाला समय कैसा रहेगा? अपना भविष्यफल जानें।' },
        ];

        const checkAndSendSliderNotif = () => {
            const lastTime = parseInt(localStorage.getItem('okSliderLastNotif') || '0', 10);
            const now = Date.now();
            
            if (now - lastTime > NOTIF_INTERVAL) {
                const randomNotif = attractiveNotifications[Math.floor(Math.random() * attractiveNotifications.length)];
                
                setNotifications(prev => [{ 
                    id: `auto-notif-${now}`, 
                    icon: randomNotif.icon, 
                    title: randomNotif.title, 
                    message: randomNotif.message, 
                    timestamp: new Date().toISOString(), 
                    read: false 
                }, ...prev]);
                
                localStorage.setItem('okSliderLastNotif', now.toString());
            }
        };
        
        checkAndSendSliderNotif();
        // Check frequently to ensure timing accuracy if app is open
        const intervalId = setInterval(checkAndSendSliderNotif, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    const handleProtectedLink = (path: string) => { if (isAuthenticated) navigate(path); else showAuth(() => navigate(path)); };

    const handleSelectDivinationType = (type: DivinationType) => {
        switch (type) {
            case DivinationType.PUJAN_SAMAGRI: navigate('/store/pujan-samagri'); break;
            case DivinationType.TANTRA_MANTRA_YANTRA_EBOOK: navigate('/store/ebooks'); break;
            case DivinationType.GEMS_JEWELRY: navigate('/store/gems-jewelry'); break;
            case DivinationType.MOBILE_ACCESSORIES: navigate('/store/mobile-accessories'); break;
            case DivinationType.LADIES_GENTS_BABY_SHOES: navigate('/store/shoes'); break;
            case DivinationType.LADIES_GENTS_ACCESSORIES: navigate('/store/accessories'); break;
            case DivinationType.COMPUTER_COURSE: navigate('/store/computer-course'); break;
            case DivinationType.MOBILE_REPAIRING_COURSE: navigate('/store/mobile-repairing'); break;
            default: break;
        }
    };
    
    const addToCart = (product: Product, quantity: number, color: string, size?: string) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id && item.selectedColor === color && item.selectedSize === size);
            if (existingItem) return prev.map(item => item.id === product.id && item.selectedColor === color && item.selectedSize === size ? { ...item, quantity: item.quantity + quantity } : item);
            return [...prev, { ...product, quantity, selectedColor: color, selectedSize: size }];
        });
    };
    
    const onUpdateCartQuantity = (productId: string, color: string, newQuantity: number, size?: string) => { 
        setCartItems(prev => prev.map(item => item.id === productId && item.selectedColor === color && item.selectedSize === size ? { ...item, quantity: newQuantity > 0 ? newQuantity : 1 } : item)); 
    };
    const onRemoveCartItem = (productId: string, color: string, size?: string) => { 
        setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedColor === color && item.selectedSize === size))); 
    };

    const activeProducts = useMemo(() => {
        return products.filter(p => {
            const deleted = p.isDeleted === true || (p.isDeleted as any) === "true";
            const hidden = p.isHidden === true || (p.isHidden as any) === "true";
            const hardDeleted = p.isHardDeleted === true || (p.isHardDeleted as any) === "true";
            
            // STRICT IMAGE CHECK ENABLED: 
            // Product MUST have a valid non-empty imageUrl1 to be displayed.
            // This ensures that products without images (e.g. newly created but not yet uploaded) are hidden.
            const hasImage = p.imageUrl1 && p.imageUrl1.trim().length > 10; // Basic check for URL validity
            
            return !deleted && !hidden && !hardDeleted && hasImage;
        });
    }, [products]);
    
    return (
        <div className="min-h-screen text-white p-4 pt-24 pb-32">
            {isSearchVisible && <SearchModal products={activeProducts} onClose={() => setIsSearchVisible(false)} />}
            
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-black to-orange-900 h-12 flex items-center justify-between px-3 border-b border-orange-700/50 shadow-lg transition-all">
                <div className="flex items-center gap-1 w-full justify-around">
                    {/* Search Icon */}
                    <button onClick={() => setIsSearchVisible(true)} className={`flex flex-col items-center justify-center w-12 py-1 rounded-lg transition-all ${isSearchVisible ? 'bg-yellow-400 text-black shadow-inner' : 'text-white'}`}>
                        <SearchIcon isActive={isSearchVisible} />
                        <span className="text-[8px] sm:text-xs text-center font-bold mt-1 uppercase tracking-tight">{t('search')}</span>
                    </button>

                    {/* Wishlist Icon */}
                    <Link to="/wishlist" className={`relative flex flex-col items-center justify-center w-12 py-1 rounded-lg transition-all ${location.pathname.startsWith('/wishlist') ? 'bg-yellow-400 text-black' : (flashWishlist ? 'bg-pink-600 text-white animate-icon-feedback' : 'text-white')}`}>
                        <div className="relative">
                            <HeartIcon isActive={location.pathname.startsWith('/wishlist')} />
                            {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center border border-black">{wishlist.length}</span>}
                            {flashWishlist && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-pink-400 text-[8px] font-black animate-fly-text whitespace-nowrap">Liked! ❤️</span>}
                        </div>
                        <span className="text-[8px] sm:text-xs text-center font-bold mt-1 uppercase tracking-tight">{t('wishlist')}</span>
                    </Link>

                    {/* Orders Icon */}
                    <button onClick={() => { handleProtectedLink('/orders'); }} className={`relative flex flex-col items-center justify-center w-12 py-1 rounded-lg transition-all ${location.pathname.startsWith('/orders') ? 'bg-yellow-400 text-black' : (flashOrder ? 'bg-orange-600 text-white animate-icon-feedback' : 'text-white')}`}>
                        <OrderIcon isActive={location.pathname.startsWith('/orders')} />
                        {flashOrder && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-orange-400 text-[8px] font-black animate-fly-text whitespace-nowrap">Updated! 📦</span>}
                        <span className="text-[8px] sm:text-xs text-center font-bold mt-1 uppercase tracking-tight">{t('my_orders')}</span>
                    </button>

                    {/* Cart Icon */}
                    <Link to="/cart" className={`relative flex flex-col items-center justify-center w-12 py-1 rounded-lg transition-all ${location.pathname.startsWith('/cart') ? 'bg-yellow-400 text-black' : (flashCart ? 'bg-green-600 text-white animate-icon-feedback' : 'text-white')}`}>
                        <div className="relative">
                            <CartIcon isActive={location.pathname.startsWith('/cart')} />
                            {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center border border-black">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                            {flashCart && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 text-[8px] font-black animate-fly-text whitespace-nowrap">+1 Added 🛒</span>}
                        </div>
                        <span className="text-[8px] sm:text-xs font-bold mt-1 uppercase tracking-tight">{t('cart')}</span>
                    </Link>

                    {/* Notification Bell Icon */}
                    <div className={`relative flex flex-col items-center justify-center w-12 py-1 text-center rounded-lg transition-all ${isNotifOpen ? 'bg-yellow-400 text-black' : (flashNotif ? 'bg-blue-600 text-white animate-vibrate' : 'text-white')}`}>
                        <NotificationBell notifications={notifications} onOpen={() => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }} onClear={() => setNotifications([])} isOpen={isNotifOpen} onToggle={setIsNotifOpen} />
                        {flashNotif && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-blue-400 text-[8px] font-black animate-fly-text whitespace-nowrap">New! 🔔</span>}
                        <span className="text-[8px] sm:text-xs font-bold mt-1 uppercase tracking-tight">{t('notifications')}</span>
                    </div>
                </div>
            </header>

            <div className="fixed top-12 left-0 right-0 z-[49] h-8 bg-black flex items-center overflow-hidden border-b border-white/5 shadow-md">
                <div className="animate-marquee-custom text-[10px] font-bold px-4 text-yellow-400 uppercase">हमारे ऐप में आपका स्वागत है बहुत सारे pdf E-book डाउनलोड करें और इन pdf E-book को बेचकर कमाई शुरू करें समय-समय पर हम कोर्स अपडेट करते रहते हैं इसलिए ऊपर दिए गए सभी सोशल मीडिया अकाउंट को फॉलो और सब्सक्राइब कर लें धन्यवाद</div>
            </div>

            <div className="container mx-auto max-w-7xl">
                <Routes>
                    <Route path="/" element={<WelcomeScreen onStart={() => navigate('/home')} />} />
                    <Route path="/home" element={<SelectionScreen onSelect={handleSelectDivinationType} isPremiumActive={isPremiumActive} products={activeProducts} categoryVisibility={categoryVisibility} />} />
                    <Route path="/store" element={<PujanSamagriStore products={activeProducts} />} />
                    <Route path="/store/:categoryUrl" element={<PujanSamagriStore products={activeProducts} />} />
                    <Route path="/product/:productId" element={<ProductDetailScreen products={activeProducts} addToCart={addToCart} />} />
                    <Route path="/cart" element={<ShoppingCartScreen cartItems={cartItems} onUpdateQuantity={onUpdateCartQuantity} onRemoveItem={onRemoveCartItem} />} />
                    <Route path="/checkout" element={<CheckoutScreen cartItems={cartItems} onPlaceOrder={(det, total, met, id, screenshot, txnId) => {
                        const newOrder: Order = { 
                            id, 
                            items: cartItems, 
                            customer: det, 
                            total, 
                            date: new Date().toISOString(), 
                            status: met === 'PREPAID' ? 'Verification Pending' : 'Processing', 
                            paymentMethod: met, 
                            paymentStatus: met === 'PREPAID' ? 'VERIFICATION_PENDING' : 'PENDING',
                            screenshotDataUrl: screenshot,
                            transactionId: txnId
                        };
                        setOrders(prev => [...prev, newOrder]); setCartItems([]);
                    }} onVerificationRequest={(req) => {
                        setPendingVerifications(prev => [...prev, { ...req, id: `vr-${Date.now()}`, requestDate: new Date().toISOString() } as any]);
                    }} />} />
                    <Route path="/orders" element={<OrderHistoryScreen orders={orders} />} />
                    <Route path="/orders/:orderId" element={<OrderConfirmationScreen orders={orders} />} />
                    <Route path="/profile" element={<ProfileScreen />} />
                    <Route path="/profile/edit" element={<AccountSettingsScreen />} />
                    <Route path="/faq" element={<FAQScreen />} />
                    <Route path="/settings" element={<SettingsScreen audioRef={audioRef} />} />
                    <Route path="/community" element={<CommunityChatScreen />} />
                    <Route path="/support" element={<SupportTicketScreen onCreateTicket={(ticket) => appContext.setSupportTickets((prev: any) => [...prev, { ...ticket, id: `st-${Date.now()}`, status: 'Open', createdAt: new Date().toISOString() }])} onVerificationRequest={(req) => {
                        setPendingVerifications(prev => [...prev, { ...req, id: `vr-${Date.now()}`, requestDate: new Date().toISOString() } as any]);
                    }} />} />
                    <Route path="/admin" element={<AdminScreen products={products} onUpdateProducts={setProducts} orders={orders} onUpdateOrders={setOrders} pendingVerifications={pendingVerifications} onApproveVerification={async (id) => {
                         const req = pendingVerifications.find(r => r.id === id);
                         if (!req) return;
                         
                         if (req.type === 'PRODUCT' && req.orderId) {
                             setOrders((prev: Order[]) => prev.map(o => {
                                 if (o.id === req.orderId) {
                                     return { ...o, status: 'Processing', paymentStatus: 'COMPLETED' };
                                 }
                                 return o;
                             }));

                             updateFirestoreOrder(req.orderId, { 
                                 status: 'Processing', 
                                 paymentStatus: 'COMPLETED' 
                             });
                         } else if (req.type === 'SUBSCRIPTION') {
                             let targetUid: string | undefined;
                             const userEmail = req.userEmail;
                             const userPhone = req.userPhone;
                             
                             if (userEmail) {
                                 const user = await getUserByEmail(userEmail);
                                 if (user) targetUid = user.uid;
                             }

                             // Phone Number Fallback
                             if (!targetUid && userPhone) {
                                 const user = await getUserByPhone(userPhone);
                                 if (user) targetUid = user.uid;
                             }

                             if (targetUid) {
                                 const expiry = new Date(); 
                                 let dLimit = 0;
                                 let duration = 30; // Default

                                 if (req.planName.includes('Weekly')) { duration = 7; dLimit = 12; }
                                 else if (req.planName.includes('Fortnight')) { duration = 15; dLimit = 25; }
                                 else if (req.planName.includes('Monthly')) { duration = 30; dLimit = 60; }
                                 else if (req.planName.includes('Quarterly')) { duration = 90; dLimit = 100; }
                                 else if (req.planName.includes('Half-Yearly')) { duration = 180; dLimit = 200; }
                                 else if (req.planName.includes('Yearly')) { duration = 365; dLimit = 999999; }

                                 expiry.setDate(expiry.getDate() + duration);

                                 await saveUserProfile(targetUid, {
                                     isPremium: true,
                                     subscriptionPlan: req.planName,
                                     subscriptionExpiry: expiry.toISOString(),
                                     downloadsLimit: dLimit
                                 });
                             }
                         } else if (req.type === 'SUPPORT_CHAT') {
                             let targetUid: string | undefined;
                             const userEmail = req.userEmail;
                             const userPhone = req.userPhone;

                             if (userEmail) {
                                 const user = await getUserByEmail(userEmail);
                                 if (user) targetUid = user.uid;
                             }

                             // Phone Number Fallback
                             if (!targetUid && userPhone) {
                                 const user = await getUserByPhone(userPhone);
                                 if (user) targetUid = user.uid;
                             }

                             if (targetUid) {
                                 const expiry = new Date();
                                 expiry.setDate(expiry.getDate() + 7); // 7 days validity
                                 
                                 await saveUserProfile(targetUid, {
                                     whatsappSupportExpiry: expiry.toISOString()
                                 });
                             }
                         }
                         
                         setPendingVerifications(prev => prev.filter(r => r.id !== id));
                         deleteFirestoreVerification(id); 
                    }} supportTickets={appContext.supportTickets} onUpdateTicket={(t) => appContext.setSupportTickets((p: any) => p.map((x: any) => x.id === t.id ? t : x))} socialMediaPosts={socialMediaPosts} onCreatePost={(post) => setSocialMediaPosts(p => [...p, {...post, id: `sm-${Date.now()}`, createdAt: new Date().toISOString()} as any])} onUpdatePost={(post) => setSocialMediaPosts(p => p.map(x => x.id === post.id ? post : x))} onDeletePost={(postId) => setSocialMediaPosts(p => p.filter(x => x.id !== postId))} categoryVisibility={categoryVisibility} onUpdateCategoryVisibility={setCategoryVisibility} socialVisibility={socialVisibility} onUpdateSocialVisibility={setCategoryVisibility} />} />
                    <Route path="/wishlist" element={<WishlistScreen products={activeProducts} />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/premium" element={<PremiumScreen onSelectPlan={(plan) => { setSelectedSubscriptionPlan(plan); navigate('/subscribe'); }} isTrialAvailable={true} onBack={() => navigate('/home')} />} />
                    <Route path="/subscribe" element={<SubscriptionPaymentScreen plan={selectedSubscriptionPlan} userProfile={currentUser} onVerificationRequest={(req) => { setPendingVerifications(prev => [...prev, { ...req, id: `vr-${Date.now()}`, requestDate: new Date().toISOString() } as any]); navigate('/subscription-confirmed'); }} onBack={() => navigate('/premium')} />} />
                    <Route path="/subscription-confirmed" element={<SubscriptionConfirmationScreen expiryDate={null} />} />
                    <Route path="/divination/:toolType" element={<DivinationScreen />} />
                </Routes>
            </div>

            <audio ref={audioRef} src="https://aistudio.google.com/static/sounds/background_music.mp3" loop autoPlay />
            <BottomNavBar cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />

            <footer className="text-center text-xs text-orange-400/60 mt-12 pb-24 sm:pb-8 relative z-10">
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-8">
                    
                    {/* Verified Icon */}
                    <div className="group flex flex-col items-center gap-2 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-900/40 to-green-600/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] group-hover:border-green-400/50 transition-all duration-500 group-hover:-translate-y-1">
                            <svg className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500/60 group-hover:text-green-400 transition-colors">Verified</span>
                    </div>

                    {/* Secure Icon */}
                    <div className="group flex flex-col items-center gap-2 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] group-hover:border-blue-400/50 transition-all duration-500 group-hover:-translate-y-1">
                            <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 group-hover:text-blue-400 transition-colors">Secure</span>
                    </div>

                    {/* Fast Icon */}
                    <div className="group flex flex-col items-center gap-2 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-900/40 to-orange-600/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.1)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] group-hover:border-orange-400/50 transition-all duration-500 group-hover:-translate-y-1">
                            <svg className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-500/60 group-hover:text-orange-400 transition-colors">Fast</span>
                    </div>

                    {/* Support Icon */}
                    <div className="group flex flex-col items-center gap-2 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-900/40 to-pink-600/10 border border-pink-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.1)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] group-hover:border-pink-400/50 transition-all duration-500 group-hover:-translate-y-1">
                            <svg className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-pink-500/60 group-hover:text-pink-400 transition-colors">Support</span>
                    </div>

                </div>
                
                <div className="flex justify-center items-center gap-2 opacity-30 mt-6">
                    <div className="w-16 h-[1px] bg-white"></div>
                    <div className="w-2 h-2 rounded-full border border-white"></div>
                    <div className="w-16 h-[1px] bg-white"></div>
                </div>

                <p className="mt-4 text-[10px] uppercase tracking-[0.2em]">{t('copyright')}</p>
            </footer>
        </div>
    );
};

export default AppComp;
