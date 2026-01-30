
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

// Reusable Product Card component for the showcase
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);
    const { wishlist, toggleWishlist } = useAppContext();
    const isLiked = wishlist.includes(product.id);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="group block flex-none w-40 sm:w-48 relative">
            <Card className="p-3 h-full flex flex-col justify-between !bg-white/5 hover:!bg-purple-500/10 active:!bg-amber-500/20 active:!border-amber-400 active:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300">
                {/* Image Container with Padding and Rounded Corners */}
                <div className="relative overflow-hidden rounded-lg mb-3 icon-glow-saffron bg-black/20 h-32 flex items-center justify-center p-1">
                    <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                        {(!product.imageUrl1 || imageError) ? (
                            <div className="w-full h-full bg-gray-900/50 rounded-lg"></div>
                        ) : (
                            <img
                                src={product.imageUrl1}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                                onError={() => setImageError(true)}
                            />
                        )}
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <Link to={`/product/${product.id}`}>
                    <div>
                        <h3 className="text-sm font-hindi font-bold text-white truncate">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-lg font-bold text-pink-400">₹{discountedPrice.toFixed(0)}</p>
                            {product.discountPercentage > 0 && (
                                <p className="text-xs text-purple-300 line-through">₹{product.mrp.toFixed(0)}</p>
                            )}
                        </div>
                    </div>
                </Link>
            </Card>
        </div>
    );
};

interface ProductShowcaseSliderProps {
    title: string;
    products: Product[];
    viewAllLink: string;
}

const ProductShowcaseSlider: React.FC<ProductShowcaseSliderProps> = ({ title, products, viewAllLink }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    const scroll = (scrollOffset: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    const startAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) { // Add tolerance
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scroll(clientWidth / 2);
                }
            }
        }, 4000);
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (!isHovering) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
        return () => stopAutoScroll();
    }, [isHovering, products]); // re-trigger if products change

    if (products.length === 0) return null;

    return (
        <div
            className="text-left relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl md:text-3xl font-hindi font-bold text-purple-300 border-b-2 border-purple-500/20 pb-3">
                    {title}
                </h3>
                <Link to={viewAllLink} className="text-purple-300 hover:text-white transition font-semibold">
                    सभी देखें &rarr;
                </Link>
            </div>
            <div className="relative">
                <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 pb-4 category-tabs -mx-4 px-4" style={{ scrollSnapType: 'x mandatory' }}>
                    {products.map(product => (
                        <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
                             <ProductCard product={product} />
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => scroll(-300)}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-slate-800/50 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-purple-500/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10 flex items-center justify-center shadow-lg"
                    aria-label="Scroll left"
                >
                    &lt;
                </button>
                <button
                    onClick={() => scroll(300)}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-slate-800/50 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-purple-500/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10 flex items-center justify-center shadow-lg"
                    aria-label="Scroll right"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default ProductShowcaseSlider;
