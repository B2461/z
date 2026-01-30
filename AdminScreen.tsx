
import React from 'react';
import { Product, VerificationRequest, Order, SupportTicket, SocialMediaPost } from '../types';
import AdminPanel from './AdminPanel';
import Card from './Card';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

interface AdminScreenProps {
    products: Product[];
    onUpdateProducts: (products: Product[]) => void;
    orders: Order[];
    onUpdateOrders: (orders: Order[]) => void;
    pendingVerifications: VerificationRequest[];
    onApproveVerification: (requestId: string) => void;
    supportTickets: SupportTicket[];
    onUpdateTicket: (ticket: SupportTicket) => void;
    socialMediaPosts: SocialMediaPost[];
    onCreatePost: (post: Omit<SocialMediaPost, 'id' | 'createdAt'>) => void;
    onUpdatePost: (post: SocialMediaPost) => void;
    onDeletePost: (postId: string) => void;
    categoryVisibility: Record<string, boolean>;
    onUpdateCategoryVisibility: (visibility: Record<string, boolean>) => void;
    socialVisibility: Record<string, boolean>;
    onUpdateSocialVisibility: (visibility: Record<string, boolean>) => void;
}

const AdminScreen: React.FC<AdminScreenProps> = (props) => {
    const { isAuthenticated, showAuth, currentUser } = useAppContext();
    const navigate = useNavigate();

    // ---------------------------------------------------------
    // 🔒 ADMIN SECURITY CONFIGURATION (एडमिन सुरक्षा सेटिंग्स)
    // ---------------------------------------------------------
    // अपना ईमेल यहाँ लिखें। केवल यही लोग एडमिन पैनल देख पाएंगे।
    const ALLOWED_ADMINS = [
        "bp9305968@gmail.com",   // <--- आपकी मुख्य आईडी (Primary Admin)
        "admin@gmail.com",
        "okfuturezone@gmail.com"
    ];
    // ---------------------------------------------------------

    const handleLogin = () => {
        showAuth();
    };

    // 1. If not logged in at all
    if (!isAuthenticated) {
        return (
            <Card className="animate-fade-in max-w-md mx-auto text-center mt-10">
                <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; होम</Link>
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔒</span>
                </div>
                <h2 className="text-3xl font-hindi font-bold text-white mb-4">एडमिन सुरक्षा</h2>
                <p className="text-purple-200 mb-8">
                    एडमिन पैनल तक पहुँचने के लिए कृपया अपनी एडमिन आईडी से लॉगिन करें।
                </p>
                <button 
                    onClick={handleLogin}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    लॉगिन करें
                </button>
            </Card>
        );
    }

    // 2. If logged in, check if Email matches the Allowed Admins list
    const userEmail = currentUser?.email || '';
    // Check if userEmail is in the list (case-insensitive check)
    const isAdmin = ALLOWED_ADMINS.some(admin => admin.toLowerCase() === userEmail.toLowerCase());

    if (!isAdmin) {
        return (
            <Card className="animate-fade-in max-w-md mx-auto text-center mt-10 border-red-500/50 bg-red-900/10">
                <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; होम</Link>
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <span className="text-4xl text-white">🚫</span>
                </div>
                <h2 className="text-3xl font-hindi font-black text-red-500 mb-2">प्रवेश वर्जित (Access Denied)</h2>
                <p className="text-white font-bold mb-2">{userEmail}</p>
                <p className="text-gray-400 text-sm mb-8">
                    यह खाता एडमिन नहीं है। आपकी IP एड्रेस और गतिविधि को सुरक्षा कारणों से नोट किया गया है।
                </p>
                <button 
                    onClick={() => navigate('/profile')}
                    className="px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all"
                >
                    मेरी प्रोफाइल पर जाएं
                </button>
            </Card>
        );
    }

    // 3. If Authenticated AND Admin -> Show Panel
    return <AdminPanel {...props} />;
};

export default AdminScreen;
