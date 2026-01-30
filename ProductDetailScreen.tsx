
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Fix: ProductComment is now available in types.ts
import { Product, ProductComment } from '../types';
import Card from './Card';
import { useAppContext } from '../App';
import { subscribeToProductComments } from '../services/firebaseService';

const ProductDetailScreen: React.FC<{ products: Product[]; addToCart: (product: Product, quantity: number, color: string, size?: string) => void }> = ({ products, addToCart }) => {
    const { wishlist, toggleWishlist, isPremiumActive, currentUser, trackDownload } = useAppContext() as any;
    const { productId } = useParams<{ productId: string }>();
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    
    const product = products.find(p => p.id === productId);
    const isLiked = product ? wishlist.includes(product.id) : false;

    useEffect(() => {
        if (product) {
            // Priority: If video exists, show video first
            if (product.reviewVideoUrl) {
                setActiveMedia('video');
            } else {
                setActiveMedia('image');
            }
            
            const colors = product.colors || [];
            const sizes = product.sizes || [];
            if (colors.length > 0) setSelectedColor(colors[0]);
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            setQuantity(1);
            setAddedToCart(false);
            setImageError(false);
        }
    }, [product]);

    if (!product) return <Card className="text-center py-20"><h2 className="text-white text-2xl font-hindi">उत्पाद नहीं मिला</h2></Card>;

    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);

    const cleanYoutubeUrl = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&rel=0` : url;
    };

    const getYouTubeThumbnail = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&rel=0` : url;
    };

    const handleAddToCart = () => {
        const colorForCart = product.productType === 'DIGITAL' ? 'Digital' : (selectedColor || 'N/A');
        addToCart(product, quantity, colorForCart, selectedSize);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleDownload = async () => {
        if (!isPremiumActive) { 
            alert("केवल प्रीमियम सदस्यों के लिए।"); 
            return; 
        }

        // --- ENHANCED LIMIT LOGIC ---
        let limit = currentUser?.downloadsLimit || 0;
        const consumed = currentUser?.downloadsConsumed || 0;

        // Default limit calculation if not explicitly set in profile
        if ((!limit || limit === 0) && currentUser?.subscriptionPlan) {
            const pName = currentUser.subscriptionPlan.toLowerCase();
            if (pName.includes('weekly')) limit = 12;
            else if (pName.includes('fortnight')) limit = 25;
            else if (pName.includes('monthly')) limit = 60;
            else if (pName.includes('quarterly')) limit = 100;
            else if (pName.includes('half-yearly')) limit = 200;
            else if (pName.includes('yearly')) limit = 999999;
        }

        const isUnlimited = limit > 90000;

        if (!isUnlimited && consumed >= limit) {
            alert(`आपकी डाउनलोड सीमा समाप्त हो गई है। (${consumed}/${limit})\nकृपया अपना प्लान अपग्रेड करें।`);
            return;
        }

        // FIX: Open Window IMMEDIATELY
        if (product.googleDriveLink) {
            window.open(product.googleDriveLink, '_blank');
            // Track in background using atomic increment
            await trackDownload();
        } else {
            alert("डाउनलोड लिंक उपलब्ध नहीं है।");
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto pb-32">
            {/* 1. TOP MEDIA SECTION (Video First) */}
            <div className="relative w-full aspect-[9/16] sm:aspect-video bg-black rounded-b-3xl sm:rounded-b-[2.5rem] overflow-hidden shadow-2xl border-x border-b border-white/10 saffron-glow-slow">
                {activeMedia === 'video' && product.reviewVideoUrl ? (
                    product.reviewVideoUrl.includes('youtube.com') || product.reviewVideoUrl.includes('youtu.be') ? (
                        <iframe 
                            src={cleanYoutubeUrl(product.reviewVideoUrl)} 
                            className="w-full h-full object-cover" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        />
                    ) : (
                        <video src={product.reviewVideoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline controls />
                    )
                ) : (
                    (!product.imageUrl1 || imageError) ? (
                        <div className="w-full h-full bg-gray-900/50"></div>
                    ) : (
                        <img 
                            src={product.imageUrl1} 
                            className="w-full h-full object-cover" 
                            alt={product.name} 
                            onError={() => setImageError(true)}
                        />
                    )
                )}

                {/* Back Button Overlay */}
                <Link to="/store" className="absolute top-6 left-6 bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/60 transition-all z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </Link>

                {/* Wishlist Overlay */}
                <button onClick={() => toggleWishlist(product.id)} className={`absolute top-6 right-6 bg-black/40 backdrop-blur-md p-3 rounded-full transition-all z-10 ${isLiked ? 'text-pink-500' : 'text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
            </div>

            {/* 2. MEDIA TOGGLE SELECTOR (Folders) */}
            <div className="flex gap-4 px-4 sm:px-6 py-4 overflow-x-auto no-scrollbar">
                {product.reviewVideoUrl && (
                    <button 
                        onClick={() => setActiveMedia('video')}
                        className={`flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all group ${activeMedia === 'video' ? 'border-orange-500 ring-2 ring-orange-500/50 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                    >
                        <img src={getYouTubeThumbnail(product.reviewVideoUrl) || product.imageUrl1} className="w-full h-full object-cover" alt="Video Thumbnail" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 group-hover:bg-black/20 transition-colors">
                            <span className="text-2xl bg-red-600 rounded-full p-2 shadow-lg">▶️</span>
                        </div>
                        <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm py-1">
                            <p className="text-[9px] text-white font-black text-center uppercase tracking-widest">VIDEO</p>
                        </div>
                    </button>
                )}
                
                {product.imageUrl1 && !imageError && (
                    <button 
                        onClick={() => setActiveMedia('image')}
                        className={`flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all group ${activeMedia === 'image' ? 'border-orange-500 ring-2 ring-orange-500/50 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                    >
                        <img src={product.imageUrl1} className="w-full h-full object-cover" alt="Image Thumbnail" onError={() => setImageError(true)} />
                        <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm py-1">
                            <p className="text-[9px] text-white font-black text-center uppercase tracking-widest">IMAGE</p>
                        </div>
                    </button>
                )}

                {/* If no image or error, show placeholder background */}
                {(!product.imageUrl1 || imageError) && !product.reviewVideoUrl && (
                     <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gray-900/50 border border-white/10"></div>
                )}
            </div>

            {/* 3. PRODUCT INFO & ADD TO CART SECTION */}
            <div className="px-4">
                <Card className="!bg-black/40 border-white/5 p-6 rounded-3xl sm:rounded-[2.5rem] text-left">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl font-hindi font-black text-white leading-tight">{product.name}</h1>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${product.productType === 'DIGITAL' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                            {product.productType}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <p className="text-3xl font-black text-pink-500">₹{discountedPrice.toFixed(0)}</p>
                        <p className="text-sm text-gray-500 line-through">₹{product.mrp}</p>
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded">{product.discountPercentage}% OFF</span>
                    </div>

                    <p className="text-sm text-gray-400 font-hindi mb-8 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                        {product.description}
                    </p>

                    {/* 4. ACTION CONTROLS */}
                    <div className="space-y-6">
                        {product.productType === 'PHYSICAL' && (
                            <div className="space-y-4">
                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-2 block">
                                            Select Color: <span className="text-white ml-1">{selectedColor}</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.colors.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setSelectedColor(c)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200 shadow-lg ${
                                                        selectedColor === c 
                                                        ? 'bg-white text-black border-white scale-105' 
                                                        : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30'
                                                    }`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {product.sizes && product.sizes.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-2 block">
                                            Select Size: <span className="text-white ml-1">{selectedSize}</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedSize(s)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200 shadow-lg ${
                                                        selectedSize === s 
                                                        ? 'bg-white text-black border-white scale-105' 
                                                        : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                            {product.productType === 'PHYSICAL' && (
                                <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-4 hover:bg-white/10 text-white font-bold">-</button>
                                    <span className="w-8 text-center font-bold">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)} className="p-4 hover:bg-white/10 text-white font-bold">+</button>
                                </div>
                            )}

                            {product.productType === 'DIGITAL' && isPremiumActive ? (
                                <button 
                                    onClick={handleDownload}
                                    className="flex-grow py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest border-b-4 border-blue-800"
                                >
                                    📥 DOWNLOAD (VIP)
                                </button>
                            ) : (
                                <button 
                                    onClick={handleAddToCart}
                                    className={`flex-grow py-5 font-black rounded-2xl shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest border-b-4 ${addedToCart ? 'bg-green-600 border-green-800 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-800 text-white'}`}
                                >
                                    {addedToCart ? 'ADDED! ✅' : 'Buy Now 🛒'}
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProductDetailScreen;
