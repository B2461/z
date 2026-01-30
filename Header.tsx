import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center gap-4">
                Ok-E-store
            </h1>
            <p className="mt-4 text-lg text-purple-200">अपने अतीत, वर्तमान और भविष्य की खोज करें</p>
        </header>
    );
};

export default Header;