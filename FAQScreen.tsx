
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';

const FAQScreen: React.FC = () => {
    const navigate = useNavigate();
    const faqs = [
        { q: "ऑर्डर कितने दिनों में डिलीवर होगा?", a: "आमतौर पर 3 से 7 कार्य दिवसों में।" },
        { q: "ई-बुक कैसे डाउनलोड करें?", a: "पेमेंट सफल होने के बाद आपके ईमेल और व्हाट्सएप पर डाउनलोड लिंक भेजा जाएगा।" },
        { q: "क्या रिफंड उपलब्ध है?", a: "भौतिक उत्पादों के लिए 24 घंटे के भीतर अनबॉक्सिंग वीडियो के साथ दावा करने पर रिप्लेसमेंट मिलता है। ई-बुक के लिए कोई रिफंड नहीं है।" },
        { q: "कस्टमर केयर से कैसे जुड़ें?", a: "आप सपोर्ट सेक्शन में टिकट बना सकते हैं या व्हाट्सएप बटन का उपयोग कर सकते हैं।" }
    ];

    return (
        <Card className="max-w-md mx-auto animate-fade-in pb-24 text-left">
            <button onClick={() => navigate('/profile')} className="text-purple-300 font-bold mb-6">&larr; वापस</button>
            <h2 className="text-2xl font-black text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10">
                        <p className="font-bold text-orange-400 mb-2 font-hindi">प्रश्न: {faq.q}</p>
                        <p className="text-gray-300 text-sm font-hindi">उत्तर: {faq.a}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default FAQScreen;
