
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const banners = [
    {
        id: 'promo-main-1',
        gradient: 'bg-gradient-to-r from-purple-800 to-indigo-900',
        link: '/store',
        alt: 'Special Offer',
        title: 'Special Offer',
        subtitle: 'Shop Now'
    },
    {
        id: 1,
        gradient: 'bg-gradient-to-r from-blue-900 to-slate-900',
        link: '/store',
        alt: 'Electronic Accessories & E-Book Sale',
        title: 'Electronics Sale',
        subtitle: 'Up to 50% Off'
    },
    {
        id: 2,
        gradient: 'bg-gradient-to-r from-emerald-900 to-teal-900',
        link: '/store/mobile-accessories',
        alt: 'Mobile Accessories Shop Now',
        title: 'Mobile Accessories',
        subtitle: 'Trending Gadgets'
    },
    {
        id: 3,
        gradient: 'bg-gradient-to-r from-rose-900 to-pink-900',
        link: '/store/ebooks',
        alt: 'E-Books Collection',
        title: 'E-Books Library',
        subtitle: 'Instant Downloads'
    }
];

const BannerSlider: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleBannerClick = (link: string) => {
        navigate(link);
    };

    return (
        <div className="w-full max-w-7xl mx-auto mb-6 relative rounded-xl overflow-hidden shadow-2xl group border border-white/10">
            <div 
                className="relative w-full h-40 sm:h-64 md:h-80 lg:h-96 transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(0)` }} 
            >
               {/* Using Flex container for sliding */}
               <div 
                    className="absolute top-0 left-0 w-full h-full flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
               >
                   {banners.map((banner) => (
                       <div 
                           key={banner.id} 
                           className={`w-full h-full flex-shrink-0 cursor-pointer relative flex flex-col items-center justify-center ${banner.gradient}`}
                           onClick={() => handleBannerClick(banner.link)}
                       >
                           <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{banner.title}</h2>
                           <p className="text-xl md:text-2xl text-purple-200 drop-shadow-md border border-white/20 px-4 py-1 rounded-full">{banner.subtitle}</p>
                       </div>
                   ))}
               </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${
                            index === currentIndex ? 'bg-white scale-125 w-6' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            
            {/* Navigation Arrows */}
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev + 1) % banners.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
};

export default BannerSlider;
