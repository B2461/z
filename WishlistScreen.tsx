
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface WishlistScreenProps {
    products: Product[];
}

const WishlistItem: React.FC<{ product: Product }> = ({ product }) => {
    const { toggleWishlist } = useAppContext();
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="group relative block">
            <Card className="p-4 h-full flex flex-col justify-between !bg-white/5 hover:!bg-purple-500/10 active:!bg-amber-500/20 active:!border-amber-400 active:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300">
                <div className="relative overflow-hidden rounded-lg mb-4 icon-glow-saffron bg-black/20 h-48 flex items-center justify-center p-3">
                    <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                        {(!product.imageUrl1 || imageError) ? (
                            <div className="w-full h-full bg-gray-900/50 rounded-lg"></div>
                        ) : (
                            <img 
                                src={product.imageUrl1} 
                                alt={product.name} 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={() => setImageError(true)}
                            />
                        )}
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur-sm rounded-full text-pink-500 hover:scale-110 transition-transform z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <Link to={`/product/${product.id}`}>
                    <div>
                        <h3 className="text-lg font-hindi font-bold text-white truncate">{product.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-xl font-bold text-pink-400">₹{discountedPrice.toFixed(0)}</p>
                            {product.discountPercentage > 0 && (
                                <p className="text-md text-purple-300 line-through">₹{product.mrp.toFixed(0)}</p>
                            )}
                        </div>
                    </div>
                </Link>
                <Link 
                    to={`/product/${product.id}`}
                    className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-center rounded-lg text-sm font-semibold text-purple-200 transition-colors block"
                >
                    ऑर्डर करें
                </Link>
            </Card>
        </div>
    );
};

const WishlistScreen: React.FC<WishlistScreenProps> = ({ products }) => {
    const { wishlist, t } = useAppContext();

    const likedProducts = products.filter(product => wishlist.includes(product.id));

    return (
        <Card className="animate-fade-in">
            <Link to="/store" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                मेरी पसंद (Wishlist)
            </h2>

            {likedProducts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">💔</div>
                    <p className="text-purple-200 text-lg">आपकी विशलिस्ट खाली है।</p>
                    <Link to="/store" className="mt-6 inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                        शॉपिंग करें
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {likedProducts.map(product => (
                        <WishlistItem key={product.id} product={product} />
                    ))}
                </div>
            )}
        </Card>
    );
};

export default WishlistScreen;
