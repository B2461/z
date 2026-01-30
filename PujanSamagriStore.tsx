
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Product, ProductCategory } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface PujanSamagriStoreProps {
    products: Product[];
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);
    const { wishlist, toggleWishlist } = useAppContext();
    const isLiked = wishlist.includes(product.id);
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    const getThumbnail = (url: string | undefined) => {
        if (!url) return product.imageUrl1;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        if (match && match[1]) {
            return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        }
        return product.imageUrl1;
    };

    if (!product.imageUrl1 || imageError) return null;

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div className="group block relative w-full px-0.5 cursor-pointer" onClick={handleCardClick}>
            <Card className="!p-0 h-full flex flex-col justify-between overflow-hidden !bg-[#121212] border-white/10 hover:border-orange-500/50 active:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300">
                <div className="relative w-full h-full aspect-[9/16] bg-black overflow-hidden border-b border-white/5 icon-glow-saffron">
                    <img 
                        src={getThumbnail(product.reviewVideoUrl)} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                    
                    {/* Play Button Overlay */}
                    {product.reviewVideoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform border border-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>
                    )}

                    {/* Video Label */}
                    {product.reviewVideoUrl && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-20">
                            <span className="animate-pulse text-red-500 text-[5px]">●</span>
                            <span className="text-[7px] font-black text-white uppercase tracking-tighter">Video</span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault(); 
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-pink-600 transition-all active:scale-90 border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white/90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Text Content Below Image */}
                <div className="p-3 bg-[#181818] flex flex-col justify-center flex-grow">
                    <h3 className="text-[11px] font-hindi font-bold text-white truncate leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-black text-pink-400">₹{discountedPrice.toFixed(0)}</p>
                        {product.discountPercentage > 0 && (
                            <p className="text-[10px] text-gray-400 line-through">₹{product.mrp.toFixed(0)}</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

const PujanSamagriStore: React.FC<PujanSamagriStoreProps> = ({ products }) => {
    const { categoryUrl } = useParams<{ categoryUrl: string }>();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
    
    const shoppingCategoryUrlMap: Record<string, ProductCategory> = {
        'mobile-accessories': 'Mobile Accessories',
        'shoes': 'Shoes',
        'accessories': 'Accessories',
        'computer-course': 'Computer Course',
        'mobile-repairing': 'Mobile Repairing Course',
        'skills': 'Skill Learning',
        'business-stories': 'Business Motivation',
        'audio-stories': 'Audio Story'
    };
    const spiritualCategoryUrlMap: Record<string, ProductCategory> = {
        'pujan-samagri': 'Pujan Samagri',
        'ebooks': 'Tantra Mantra Yantra E-book',
        'gems-jewelry': 'Gems & Jewelry',
    };
    const allCategoryUrlMap = { ...shoppingCategoryUrlMap, ...spiritualCategoryUrlMap };

    const currentMappedCategory = categoryUrl ? allCategoryUrlMap[categoryUrl] : undefined;
    const isShoppingView = !!(currentMappedCategory && (shoppingCategoryUrlMap as Record<string, string>)[categoryUrl!]) || (categoryUrl === 'shopping');
    const title = isShoppingView ? 'शॉपिंग ज़ोन' : 'आध्यात्मिक स्टोर';

    const categories = useMemo(() => {
        return isShoppingView
            ? ['All', ...Object.values(shoppingCategoryUrlMap)]
            : ['All', ...Object.values(spiritualCategoryUrlMap)];
    }, [isShoppingView]);

    useEffect(() => {
        if (currentMappedCategory) {
            setSelectedCategory(currentMappedCategory);
        } else {
            setSelectedCategory('All');
        }
    }, [categoryUrl, currentMappedCategory]);
    
    const filteredProducts = useMemo(() => {
        let productPool: Product[] = [];
        const relevantCategories = isShoppingView ? Object.values(shoppingCategoryUrlMap) : Object.values(spiritualCategoryUrlMap);
        productPool = products.filter(p => relevantCategories.includes(p.category));

        if (selectedCategory === 'All') return productPool;
        return productPool.filter(product => product.category === selectedCategory);
    }, [selectedCategory, products, isShoppingView]);

    return (
        <div className="animate-fade-in w-full pb-20 text-left">
            <Link to="/home" className="absolute top-24 left-4 text-purple-300 hover:text-white transition z-10 font-bold">&larr; होम</Link>
            
            <h2 className="text-2xl font-hindi font-black mb-6 text-center mt-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-widest">
                {title}
            </h2>

            <div className="flex overflow-x-auto gap-2.5 pb-6 mb-8 px-4 category-tabs justify-start md:justify-center">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category as any)}
                        className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all border font-black text-[9px] tracking-widest uppercase icon-glow-saffron ${
                            selectedCategory === category
                                ? 'bg-yellow-400 border-yellow-500 text-black shadow-lg scale-105'
                                : 'bg-white/5 border-white/20 text-purple-200'
                        }`}
                    >
                        {category === 'All' ? 'सभी' : category}
                    </button>
                ))}
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10 mx-6">
                    <p className="text-purple-300 font-hindi">अभी कोई सामग्री उपलब्ध नहीं है।</p>
                    <p className="text-xs text-gray-500 mt-2">एडमिन द्वारा जल्द ही लिस्टिंग की जाएगी।</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 px-2 sm:px-12">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PujanSamagriStore;
