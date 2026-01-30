
import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface TrendingVideoCollectionProps {
    products: Product[];
}

const VideoProductCard: React.FC<{ product: Product; isNew?: boolean }> = ({ product, isNew }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const { wishlist, toggleWishlist } = useAppContext();
    const isLiked = wishlist.includes(product.id);
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    // Hide card if image is missing or failed to load
    if (!product.imageUrl1 || imageError) return null;

    const isYouTube = (url: string | undefined) => {
        return url?.includes('youtube.com') || url?.includes('youtu.be');
    };

    const getThumbnail = (url: string | undefined) => {
        if (isYouTube(url)) {
            const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
            if (match && match[1]) {
                return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
            }
        }
        return product.imageUrl1;
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (!isYouTube(product.reviewVideoUrl) && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (!isYouTube(product.reviewVideoUrl) && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div 
            className="w-full relative group px-0.5 cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Card className="!p-0 h-full overflow-hidden border-white/10 !bg-[#121212] transition-all duration-300 saffron-glow-slow shadow-xl flex flex-col justify-between">
                <div className="relative w-full aspect-[9/16] bg-black overflow-hidden border-b border-white/5">
                    {isNew && (
                        <div className="absolute top-2 left-2 z-20 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse shadow-lg border border-white/20 tracking-widest uppercase">
                            NEW
                        </div>
                    )}
                    
                    <img 
                        src={getThumbnail(product.reviewVideoUrl)} 
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered && !isYouTube(product.reviewVideoUrl) ? 'opacity-0' : 'opacity-100'}`}
                        alt={product.name}
                        onError={() => setImageError(true)}
                    />

                    {!isYouTube(product.reviewVideoUrl) && product.reviewVideoUrl && (
                        <video
                            ref={videoRef}
                            src={product.reviewVideoUrl}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                            muted
                            loop
                            playsInline
                        />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center border border-white/20 shadow-2xl transition-transform group-hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-pink-600 transition-all shadow-lg border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Text Overlay Below Image */}
                <div className="p-3 bg-[#181818] flex flex-col justify-center flex-grow">
                    <h3 className="text-white font-hindi font-bold text-[11px] truncate leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-pink-400 font-black text-sm">₹{(product.mrp - (product.mrp * product.discountPercentage / 100)).toFixed(0)}</span>
                        <span className="text-gray-400 text-[10px] line-through">₹{product.mrp}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const TrendingVideoCollection: React.FC<TrendingVideoCollectionProps> = ({ products }) => {
    const videoProducts = useMemo(() => {
        return products
            .filter(p => p.reviewVideoUrl && p.reviewVideoUrl.trim() !== '' && p.imageUrl1 && p.imageUrl1.trim().length > 10);
    }, [products]);

    if (videoProducts.length === 0) return null;

    return (
        <div className="w-full mb-12 animate-fade-in mt-6 text-left">
            <div className="flex items-center gap-3 mb-6 px-4">
                <div className="bg-red-600 p-2.5 rounded-xl animate-pulse shadow-lg shadow-red-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                </div>
                <h2 className="text-2xl font-hindi font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 uppercase tracking-widest">
                    Hot Video Feed
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 px-4 sm:px-12">
                {videoProducts.map((product, index) => (
                    <div key={product.id} className="w-full">
                        <VideoProductCard product={product} isNew={index < 3} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingVideoCollection;
