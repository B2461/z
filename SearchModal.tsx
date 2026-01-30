
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';

interface SearchModalProps {
    products: Product[];
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ products, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { wishlist, toggleWishlist } = useAppContext();

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(lowercasedTerm) ||
            product.description.toLowerCase().includes(lowercasedTerm) ||
            product.category.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, products]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Close on backdrop click
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    
    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-slate-900/90 border border-purple-500/30 shadow-2xl rounded-2xl p-6 max-w-2xl w-full relative"
                role="dialog"
                aria-modal="true"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-purple-300 hover:text-white text-3xl">&times;</button>
                <h2 className="text-2xl font-hindi font-bold text-white mb-6 text-center">उत्पाद खोजें</h2>

                <div className="relative mb-6">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="उत्पाद का नाम, विवरण, या श्रेणी खोजें..."
                        className="w-full bg-white/10 p-4 pl-12 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                    />
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                    {searchTerm.trim() && filteredProducts.length > 0 && (
                        filteredProducts.map(product => {
                             const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);
                             const isLiked = wishlist.includes(product.id);
                             return (
                                <div key={product.id} className="relative group">
                                    <Link
                                        to={`/product/${product.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-transparent hover:border-purple-500/50 hover:bg-purple-900/20 transition-all"
                                    >
                                        <div className="w-16 h-16 bg-black/40 p-1.5 rounded-md flex-shrink-0 flex items-center justify-center">
                                            <img src={product.imageUrl1} alt={product.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="flex-grow overflow-hidden pr-8">
                                            <h3 className="font-hindi font-semibold text-white truncate">{product.name}</h3>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <p className="text-lg font-bold text-pink-400">₹{discountedPrice.toFixed(0)}</p>
                                                {product.discountPercentage > 0 && (
                                                    <p className="text-xs text-purple-300 line-through">₹{product.mrp.toFixed(0)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(product.id);
                                        }}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white/50 hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                             )
                        })
                    )}
                     {searchTerm.trim() && filteredProducts.length === 0 && (
                        <p className="text-center text-purple-300 py-8">कोई परिणाम नहीं मिला।</p>
                    )}
                    {!searchTerm.trim() && (
                         <p className="text-center text-purple-300 py-8">खोज शुरू करने के लिए टाइप करें।</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
