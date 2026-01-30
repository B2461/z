
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DivinationType, Product } from '../types';
import ToolShowcaseSlider from './ToolShowcaseSlider';
import { useAppContext } from '../App';
import TrendingVideoCollection from './TrendingVideoCollection';
import Card from './Card';

interface SelectionScreenProps {
    onSelect: (type: DivinationType) => void;
    isPremiumActive: boolean;
    products: Product[];
    categoryVisibility: Record<string, boolean>;
}

const GridProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);
    const { wishlist, toggleWishlist } = useAppContext();
    const isLiked = wishlist.includes(product.id);
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    // If there's an image error or no image, return null to hide it completely
    if (!product.imageUrl1 || imageError) return null;

    return (
        <div className="group block w-full relative px-0.5 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <Card className="!p-0 h-full flex flex-col justify-between overflow-hidden !bg-[#121212] border-white/10 hover:border-orange-500/50 transition-all duration-300">
                <div className="relative w-full aspect-[9/16] bg-black overflow-hidden border-b border-white/5">
                    <img 
                        src={product.imageUrl1} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-pink-600 transition-all border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <div className="p-3 bg-[#181818] flex flex-col justify-center flex-grow">
                    <h3 className="text-[11px] font-hindi font-bold text-white truncate leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-black text-pink-400">₹{discountedPrice.toFixed(0)}</p>
                        {product.discountPercentage > 0 && <p className="text-[10px] text-gray-400 line-through">₹{product.mrp.toFixed(0)}</p>}
                    </div>
                </div>
            </Card>
        </div>
    );
};

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onSelect, isPremiumActive, products }) => {
    const navigate = useNavigate();
    
    const quickCategories = [
        { label: 'मोबाइल - Mobile', icon: '📱', path: 'mobile-accessories', type: 'STORE' },
        { label: 'स्किल - Skills', icon: '🚀', path: 'skills', type: 'STORE' },
        { label: 'बिजनेस - Business', icon: '💼', path: 'business-stories', type: 'STORE' },
        { label: 'कहानियां - Stories', icon: '🎧', path: 'audio-stories', type: 'STORE' },
        { label: 'पूजा - Pujan', icon: '🕉️', path: 'pujan-samagri', type: 'STORE' },
        { label: 'ई-बुक्स - E-Books', icon: '📚', path: 'ebooks', type: 'STORE' },
        { label: 'कंप्यूटर - Computer', icon: '💻', path: 'computer-course', type: 'STORE' },
        { label: 'रिपेयरिंग - Repairing', icon: '🛠️', path: 'mobile-repairing', type: 'STORE' },
        { label: 'रत्न - Gems', icon: '💎', path: 'gems-jewelry', type: 'STORE' },
        { label: 'जूते - Shoes', icon: '👟', path: 'shoes', type: 'STORE' },
        { label: 'पर्स - Bags', icon: '👜', path: 'accessories', type: 'STORE' },
        { label: 'ऑफर - Offers', icon: '🎁', path: 'shopping', type: 'STORE' },
    ];

    const categoryOrder = [
        'Mobile Accessories', 'Tantra Mantra Yantra E-book', 'Pujan Samagri',
        'Gems & Jewelry', 'Shoes', 'Accessories', 'Computer Course',
        'Mobile Repairing Course', 'Skill Learning', 'Business Motivation', 'Audio Story'
    ];

    const availableCategories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category))) as string[];
        return cats.sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
    }, [products]);

    return (
        <div className="animate-fade-in space-y-10 pb-24 text-left">
            <section><ToolShowcaseSlider onSelect={onSelect} /></section>

            <section className="px-2 sm:px-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
                    {quickCategories.map((cat, idx) => (
                        <button key={idx} onClick={() => navigate(`/store/${cat.path}`)} className="flex flex-col items-center justify-center gap-2 p-2 sm:p-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 shadow-lg hover:border-orange-500/50 transition-all min-h-[90px]">
                            <div className="w-10 h-10 flex items-center justify-center text-xl bg-white/10 rounded-xl">{cat.icon}</div>
                            <span className="text-[9px] font-bold text-white text-center leading-tight uppercase">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {availableCategories.map((category) => {
                const categoryProducts = products.filter(p => p.category === category);
                if (categoryProducts.length === 0) return null;
                return (
                    <section key={category} className="px-2">
                        <div className="flex justify-between items-end mb-4 px-1">
                            <h3 className="text-xl font-hindi font-bold text-orange-400">{category}</h3>
                            {categoryProducts.length > 4 && <Link to="/store" className="text-[10px] text-gray-400 uppercase tracking-widest">View All</Link>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {categoryProducts.slice(0, 4).map(product => <GridProductCard key={product.id} product={product} />)}
                        </div>
                    </section>
                );
            })}

            <TrendingVideoCollection products={products} />
        </div>
    );
};

export default SelectionScreen;
