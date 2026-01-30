
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface ShoppingCartScreenProps {
    cartItems: CartItem[];
    onUpdateQuantity: (productId: string, color: string, newQuantity: number, size?: string) => void;
    onRemoveItem: (productId: string, color: string, size?: string) => void;
}

const ShoppingCartScreen: React.FC<ShoppingCartScreenProps> = ({ cartItems, onUpdateQuantity, onRemoveItem }) => {
    const navigate = useNavigate();
    const { isAuthenticated, showAuth, t } = useAppContext();

    const totalAmount = cartItems.reduce((total, item) => {
        const discountedPrice = item.mrp - (item.mrp * item.discountPercentage / 100);
        return total + discountedPrice * item.quantity;
    }, 0);
    
    const handleCheckout = () => {
        if (isAuthenticated) {
            navigate('/checkout');
        } else {
            showAuth(() => navigate('/checkout'));
        }
    };

    return (
        <Card className="animate-fade-in">
             <Link to="/store" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; खरीदारी जारी रखें</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">आपका कार्ट</h2>

            {cartItems.length === 0 ? (
                <p className="text-center text-purple-200 text-lg py-8">आपका कार्ट खाली है।</p>
            ) : (
                <>
                    <div className="space-y-4 mb-8">
                        {cartItems.map(item => (
                            <div key={`${item.id}-${item.selectedColor}-${item.selectedSize || ''}`} className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
                                <img src={item.imageUrl1} alt={item.name} className="w-20 h-20 object-contain rounded-md bg-black/20" />
                                <div className="flex-grow">
                                    <h3 className="font-hindi font-semibold text-white">{item.name}</h3>
                                    {item.productType === 'PHYSICAL' ? (
                                        <div className="text-sm text-purple-300">
                                            <p>रंग: {item.selectedColor}</p>
                                            {item.selectedSize && <p>साइज: {item.selectedSize}</p>}
                                        </div>
                                     ) : (
                                        <p className="text-sm text-purple-300 my-1">
                                            <span className="text-xs font-bold bg-blue-800/60 text-blue-200 px-2 py-1 rounded-full border border-blue-400/50">
                                                Digital E-book
                                            </span>
                                        </p>
                                     )}
                                    <p className="text-md font-bold text-pink-400">
                                        ₹{(item.mrp - (item.mrp * item.discountPercentage / 100)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => onUpdateQuantity(item.id, item.selectedColor, parseInt(e.target.value), item.selectedSize)}
                                        className="w-16 bg-white/10 p-2 text-center rounded-lg border border-white/20"
                                    />
                                    <button onClick={() => onRemoveItem(item.id, item.selectedColor, item.selectedSize)} className="text-red-400 hover:text-red-300 text-2xl px-2">&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/20 pt-6 space-y-2">
                        <div className="flex justify-between items-center text-2xl font-bold">
                            <span className="text-purple-200">कुल:</span>
                            <span className="text-white">₹{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-center mt-8">
                            <button 
                                onClick={handleCheckout}
                                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                            >
                                चेकआउट के लिए आगे बढ़ें
                            </button>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};

export default ShoppingCartScreen;
