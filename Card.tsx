import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div 
            className={`bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 transition-all duration-300 hover:shadow-purple-500/20 ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;