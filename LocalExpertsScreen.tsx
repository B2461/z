
import React, { useState, FormEvent } from 'react';
import Card from './Card';
import { findLocalExperts } from '../services/geminiService';
// Fix: Place is now available in types.ts
import { Place } from '../types';

interface LocalExpertsScreenProps {
    onBack: () => void;
}

const expertTypes = [
    'ज्योतिषी', // Astrologer
    'टैरो कार्ड रीडर', // Tarot Card Reader
    'हस्तरेखा विशेषज्ञ', // Palmist
    'अंक ज्योतिषी', // Numerologist
    'मंदिर', // Temple
    'वास्तु सलाहकार' // Vastu Consultant
];

const shopTypes = [
    'पूजा सामग्री की दुकान', // Pooja Samagri Shop
    'आध्यात्मिक किताबों की दुकान', // Spiritual Book Store
    'रत्न और क्रिस्टल की दुकान', // Gemstone and Crystal Shop
    'हस्तशिल्प की दुकान', // Handicrafts Shop
    'अगरबत्ती की दुकान' // Incense Shop
];

const LocalExpertsScreen: React.FC<LocalExpertsScreenProps> = ({ onBack }) => {
    const [location, setLocation] = useState('');
    const [expertType, setExpertType] = useState(expertTypes[0]);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const [results, setResults] = useState<Place[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!location.trim()) {
            setFormError("कृपया अपना शहर या स्थान दर्ज करें।");
            return;
        }
        setFormError(null);
        setSearchError(null);
        setIsLoading(true);
        setResults(null);

        const apiQuery = `${expertType} in ${location}`;
        const mapQuery = `${location} के 15 किलोमीटर के दायरे में ${expertType}`;
        setSearchQuery(mapQuery);

        try {
            const foundPlaces = await findLocalExperts(apiQuery);
            setResults(foundPlaces);
        } catch (err) {
            console.error(err);
            setSearchError("जानकारी प्राप्त करने में एक त्रुटि हुई। कृपया पुनः प्रयास करें।");
        } finally {
            setIsLoading(false);
        }
    };

    const mapUrl = searchQuery 
        ? `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=11&ie=UTF8&iwloc=&output=embed`
        : null;

    return (
        <Card className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition" aria-label="Go back">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">Find Local Experts and Shops</h2>
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-6">
                    <label htmlFor="expertType" className="block text-purple-200 text-lg mb-2">श्रेणी चुनें</label>
                    <select
                        id="expertType"
                        value={expertType}
                        onChange={(e) => setExpertType(e.target.value)}
                        className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                    >
                        <optgroup label="विशेषज्ञ">
                            {expertTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </optgroup>
                        <optgroup label="दुकानें">
                             {shopTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>
                <div className="mb-6">
                    <label htmlFor="location" className="block text-purple-200 text-lg mb-2">अपना शहर या स्थान दर्ज करें</label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="उदाहरण: दिल्ली"
                        className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                    />
                </div>
                {formError && <p className="text-red-400 mb-4 text-center" role="alert">{formError}</p>}
                <div className="text-center">
                    <button type="submit" disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading ? 'खोज हो रही है...' : 'खोजें'}
                    </button>
                </div>
            </form>

            {searchQuery && (
                <div className="mt-8 border-t-2 border-white/20 pt-8">
                    <h3 className="text-2xl font-hindi font-bold mb-4 text-center">Search Results</h3>
                     {mapUrl && <div className="rounded-lg overflow-hidden shadow-lg border border-white/20 mb-8">
                         <iframe
                            className="w-full h-96 border-0"
                            src={mapUrl}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map for ${searchQuery}`}
                        ></iframe>
                    </div>}

                    {isLoading && (
                         <div className="text-center p-8">
                             <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                             </div>
                             <p className="text-lg text-purple-200">विवरण लोड हो रहा है...</p>
                         </div>
                    )}
                    {searchError && <p className="text-red-400 my-4 text-center" role="alert">{searchError}</p>}
                    
                    {results && !isLoading && (
                        <div>
                            {results.length > 0 ? (
                                <div className="space-y-4">
                                    {results.map((place, index) => (
                                        <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-white">{place.name}</h4>
                                                <p className="text-purple-200">{place.address}</p>
                                            </div>
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + place.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 px-4 py-2 bg-purple-600/80 text-white text-sm font-semibold rounded-full hover:bg-purple-600 transition-colors"
                                            >
                                                दिशा-निर्देश
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                 <p className="text-center text-purple-200 p-4">इस खोज के लिए कोई परिणाम नहीं मिला।</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default LocalExpertsScreen;
