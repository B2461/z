
import React from 'react';
import { DivinationType } from '../types';
import { toolCategories } from '../data/tools';
import { useAppContext } from '../App';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTool: (type: DivinationType) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onSelectTool }) => {
    const { tDiv } = useAppContext();
    return (
        <>
            <div 
                className={`menu-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm z-50 ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div 
                className={`side-menu fixed top-0 left-0 bottom-0 w-80 bg-slate-900/90 border-r border-purple-500/30 shadow-2xl shadow-purple-900/50 p-6 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-title"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 id="menu-title" className="text-2xl font-hindi font-bold text-white">सभी टूल्स</h2>
                    <button onClick={onClose} className="text-purple-300 hover:text-white text-3xl" aria-label="Close menu">&times;</button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)] pr-2">
                    {toolCategories.map((category) => (
                        <div key={category.name} className="mb-6">
                            <h3 className="font-hindi text-xl font-semibold text-purple-300 border-b-2 border-purple-500/20 pb-2 mb-3">
                                {category.name}
                            </h3>
                            <ul className="space-y-2">
                                {category.tools.map((tool) => {
                                    const toolName = tDiv(tool.type);
                                    return (
                                        <li key={tool.type}>
                                            <button 
                                                onClick={() => onSelectTool(tool.type)}
                                                className="w-full text-left flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-purple-500/20 transition-colors duration-200"
                                            >
                                                <span className="text-2xl">{tool.icon}</span>
                                                <div>
                                                    <span className="block font-sans text-base text-white/90">{toolName.en}</span>
                                                    <span className="block font-hindi text-sm text-purple-300">{toolName.hi}</span>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SideMenu;
