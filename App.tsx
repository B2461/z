
import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { DivinationType, CartItem, Order, Product, Notification, VerificationRequest, SupportTicket, SocialMediaPost, UserProfile, SavedReading } from './types';
import { products as initialProducts } from './data/products';
import { ebooks } from './data/ebooks';
import { 
    subscribeToAuthChanges, loginUser, registerUser, logoutUser, 
    saveUserProfile, subscribeToUserOrders, subscribeToUserProfile,
    subscribeToProducts, subscribeToVerificationRequests
} from './services/firebaseService';

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
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import CommunityChatScreen from './components/CommunityChatScreen';
import AccountSettingsScreen from './components/AccountSettingsScreen';
import FAQScreen from './components/FAQScreen';

// --- Icons ---
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const SearchIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const HeartIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isActive ? 'text-pink-500 fill-pink-500' : ''}`} fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);
const OrderIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);
const CartIcon = ({ isActive }: { isActive: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

interface AppContextType {
    language: 'hi' | 'en';
    setLanguage: (lang: 'hi' | 'en') => void;
    theme: string;
    setTheme: (theme: string) => void;
    t: (key: string) => string;
    tDiv: (type: DivinationType) => { en: string; hi: string };
    isAuthenticated: boolean;
    currentUser: UserProfile | null;
    showAuth: (onSuccess?: () => void) => void;
    logout: () => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
    isPremiumActive: boolean;
    orders: Order[];
    pendingVerifications: VerificationRequest[];
    handleLogin: (email: string, password: string) => Promise<string | null>;
    handleSignup: (profile: UserProfile) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<'hi' | 'en'>(() => (localStorage.getItem('okFutureZoneLanguage') as any) || 'en');
    const [theme, setTheme] = useState(() => localStorage.getItem('okFutureZoneTheme') || 'cosmic');
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [pendingVerifications, setPendingVerifications] = useState<VerificationRequest[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [isAuthVisible, setIsAuthVisible] = useState(false);
    const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

    const isPremiumActive = useMemo(() => {
        if (!currentUser?.subscriptionExpiry) return false;
        return new Date(currentUser.subscriptionExpiry) > new Date();
    }, [currentUser]);

    useEffect(() => {
        let unsubProfile: any, unsubOrders: any, unsubVerifications: any;
        const unsubscribeAuth = subscribeToAuthChanges(async (firebaseUser) => {
            if (firebaseUser) {
                unsubProfile = subscribeToUserProfile(firebaseUser.uid, (profile) => {
                    if (profile) {
                        setCurrentUser(profile);
                        setWishlist(profile.wishlist || []);
                    }
                });
                unsubOrders = subscribeToUserOrders(firebaseUser.email!, (userOrders) => setOrders(userOrders));
                const ADMIN_EMAILS = ["bp9305968@gmail.com", "admin@gmail.com"];
                if (ADMIN_EMAILS.includes(firebaseUser.email!)) {
                    unsubVerifications = subscribeToVerificationRequests(setPendingVerifications);
                }
                setIsAuthenticated(true);
            } else {
                setCurrentUser(null);
                setOrders([]);
                setWishlist([]);
                setIsAuthenticated(false);
                if (unsubProfile) unsubProfile();
                if (unsubOrders) unsubOrders();
                if (unsubVerifications) unsubVerifications();
            }
        });
        return () => {
            unsubscribeAuth();
            if (unsubProfile) unsubProfile();
            if (unsubOrders) unsubOrders();
            if (unsubVerifications) unsubVerifications();
        };
    }, []);

    const toggleWishlist = (productId: string) => {
        const newList = wishlist.includes(productId) ? wishlist.filter(id => id !== productId) : [...wishlist, productId];
        setWishlist(newList);
        if (currentUser?.uid) saveUserProfile(currentUser.uid, { wishlist: newList });
    };

    const logout = async () => { await logoutUser(); };
    const updateProfile = async (updates: Partial<UserProfile>) => { if (currentUser?.uid) await saveUserProfile(currentUser.uid, updates); };
    const t = (key: string) => key;
    const tDiv = (type: DivinationType) => ({ en: type, hi: type });

    const handleLogin = async (email: string, password: string): Promise<string | null> => {
        try {
            await loginUser(email, password);
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return null;
        } catch (error: any) {
            return String(error.message || 'Login Failed');
        }
    };

    const handleSignup = async (profileData: UserProfile): Promise<boolean> => {
        try {
            await registerUser(profileData.email!, profileData.password!, profileData.name!);
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return true;
        } catch (error) { return false; }
    };

    return (
        <AppContext.Provider value={{ 
            language, setLanguage, theme, setTheme, t, tDiv, isAuthenticated, currentUser, 
            showAuth: (cb) => { setIsAuthVisible(true); if(cb) setAuthSuccessCallback(() => cb); }, 
            logout, updateProfile, wishlist, toggleWishlist, isPremiumActive, orders, pendingVerifications,
            handleLogin, handleSignup
        } as any}>
            {children}
            {isAuthVisible && <LoginScreen onClose={() => setIsAuthVisible(false)} onLogin={handleLogin} onSignup={handleSignup} />}
        </AppContext.Provider>
    );
};

const App: React.FC = () => {
    const { currentUser, isAuthenticated, showAuth, wishlist, orders, isPremiumActive } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<any>(null);

    useEffect(() => { if (isAuthenticated && currentUser?.cart) setCartItems(currentUser.cart); }, [isAuthenticated, currentUser?.cart]);

    useEffect(() => {
        const unsubProds = subscribeToProducts((allProds) => {
            const staticList = [...initialProducts, ...ebooks];
            const dbIds = new Set(allProds.map(p => p.id));
            const filteredStatic = staticList.filter(s => !dbIds.has(s.id));
            setProducts([...allProds, ...filteredStatic]);
        });
        return () => unsubProds();
    }, []);

    const addToCart = (product: Product, quantity: number, color: string, size?: string) => {
        const newItem = { ...product, quantity, selectedColor: color, selectedSize: size };
        const updatedCart = [...cartItems, newItem];
        setCartItems(updatedCart);
        if (isAuthenticated && currentUser?.uid) saveUserProfile(currentUser.uid, { cart: updatedCart });
    };

    const activeProducts = products.filter(p => !p.isDeleted && !p.isHidden);
    const handleProtectedLink = (path: string) => { if (isAuthenticated) navigate(path); else showAuth(() => navigate(path)); };

    return (
        <div className="min-h-screen text-white p-4 pt-24 pb-32">
            {isSearchVisible && <SearchModal products={activeProducts} onClose={() => setIsSearchVisible(false)} />}
            
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-black to-orange-900 h-14 flex items-center justify-between px-4 border-b border-orange-700/50 shadow-lg">
                <div className="flex items-center gap-4 w-full">
                    <Link to="/home" className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${location.pathname === '/home' ? 'bg-yellow-400 text-black shadow-lg' : 'text-white'}`}>
                        <HomeIcon isActive={location.pathname === '/home'} />
                        <span className="text-[8px] font-black uppercase mt-0.5">Home</span>
                    </Link>

                    <div className="h-8 w-px bg-white/10 mx-1"></div>

                    <div className="flex items-center justify-around flex-grow">
                        <button onClick={() => setIsSearchVisible(true)} className="flex flex-col items-center text-white">
                            <SearchIcon isActive={isSearchVisible} />
                            <span className="text-[8px] font-bold uppercase mt-0.5">Search</span>
                        </button>

                        <Link to="/wishlist" className="relative flex flex-col items-center text-white">
                            <HeartIcon isActive={location.pathname === '/wishlist'} />
                            {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center border border-black">{wishlist.length}</span>}
                            <span className="text-[8px] font-bold uppercase mt-0.5">Wishlist</span>
                        </Link>

                        <button onClick={() => handleProtectedLink('/orders')} className="relative flex flex-col items-center text-white">
                            <OrderIcon isActive={location.pathname === '/orders'} />
                            {orders.length > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center border border-black">{orders.length}</span>}
                            <span className="text-[8px] font-bold uppercase mt-0.5">Orders</span>
                        </button>

                        <Link to="/cart" className="relative flex flex-col items-center text-white">
                            <CartIcon isActive={location.pathname === '/cart'} />
                            {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center border border-black">{cartItems.length}</span>}
                            <span className="text-[8px] font-bold uppercase mt-0.5">Cart</span>
                        </Link>

                        <div className="relative flex flex-col items-center text-white">
                            <NotificationBell notifications={[]} onOpen={() => {}} onClear={() => {}} />
                            <span className="text-[8px] font-bold uppercase mt-0.5">Alert</span>
                        </div>
                    </div>
                </div>
            </header>

            <Routes>
                <Route path="/" element={<WelcomeScreen onStart={() => navigate('/home')} />} />
                <Route path="/home" element={<SelectionScreen products={activeProducts} onSelect={() => {}} isPremiumActive={isPremiumActive} categoryVisibility={{}} />} />
                <Route path="/store" element={<PujanSamagriStore products={activeProducts} />} />
                <Route path="/store/:categoryUrl" element={<PujanSamagriStore products={activeProducts} />} />
                <Route path="/product/:productId" element={<ProductDetailScreen products={activeProducts} addToCart={addToCart} />} />
                <Route path="/cart" element={<ShoppingCartScreen cartItems={cartItems} onUpdateQuantity={() => {}} onRemoveItem={() => {}} />} />
                <Route path="/checkout" element={<CheckoutScreen cartItems={cartItems} onPlaceOrder={() => setCartItems([])} onVerificationRequest={() => {}} />} />
                <Route path="/orders" element={<OrderHistoryScreen orders={orders} />} />
                <Route path="/orders/:orderId" element={<OrderConfirmationScreen orders={orders} />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/profile/edit" element={<AccountSettingsScreen />} />
                <Route path="/faq" element={<FAQScreen />} />
                <Route path="/settings" element={<SettingsScreen audioRef={audioRef} />} />
                <Route path="/community" element={<CommunityChatScreen />} />
                <Route path="/support" element={<SupportTicketScreen onCreateTicket={() => {}} onVerificationRequest={() => {}} />} />
                <Route path="/premium" element={<PremiumScreen onSelectPlan={(p: any) => { setSelectedSubscriptionPlan(p); navigate('/subscribe'); }} isTrialAvailable={false} onBack={() => navigate('/home')} />} />
                <Route path="/subscribe" element={<SubscriptionPaymentScreen plan={selectedSubscriptionPlan} userProfile={currentUser} onVerificationRequest={() => navigate('/subscription-confirmed')} onBack={() => navigate('/premium')} />} />
                <Route path="/subscription-confirmed" element={<SubscriptionConfirmationScreen expiryDate={null} />} />
                <Route path="/admin" element={<AdminScreen products={products} onUpdateProducts={() => {}} orders={orders} onUpdateOrders={() => {}} pendingVerifications={[]} onApproveVerification={async () => {}} supportTickets={[]} onUpdateTicket={() => {}} socialMediaPosts={[]} onCreatePost={() => {}} onUpdatePost={() => {}} onDeletePost={() => {}} categoryVisibility={{}} onUpdateCategoryVisibility={() => {}} socialVisibility={{}} onUpdateSocialVisibility={() => {}} />} />
                <Route path="/wishlist" element={<WishlistScreen products={activeProducts} />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
            </Routes>
            
            <audio ref={audioRef} src="https://aistudio.google.com/static/sounds/background_music.mp3" loop autoPlay />
            <BottomNavBar cartItemCount={cartItems.length} />
        </div>
    );
};

export default App;
