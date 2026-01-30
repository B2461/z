
import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';

const TermsAndConditions: React.FC = () => {
    const { t } = useAppContext();
    return (
        <Card className="animate-fade-in max-w-4xl mx-auto text-left mb-20">
            <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Terms & Conditions</h2>
            
            <div className="space-y-6 text-purple-200 prose prose-invert prose-p:text-purple-200 prose-h3:text-white prose-h3:font-hindi prose-ul:text-purple-200 text-sm sm:text-base">
                <p className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs"><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <p>Please read these terms carefully before using the "Ok-E-store" app. By using this app, you agree to be legally bound by these terms.</p>

                <h3>1. Eligibility & Account</h3>
                <p>You must be at least 13 years old to use this app. You are fully responsible for maintaining the confidentiality of your account information and password. Accounts may be immediately terminated in cases of illegal or suspicious activities.</p>

                <h3>2. Product Description</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Physical Products:</strong> Worship materials, mobile accessories, shoes, gemstones, etc.</li>
                    <li><strong>Digital Products:</strong> PDF E-books and software content.</li>
                </ul>

                <h3>3. Payment & Security</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>All payments are accepted via secure UPI gateways.</li>
                    <li><strong>Warning:</strong> Providing fake Transaction IDs or screenshots is a legal offense. We reserve the right to take legal action and permanently block the user in such cases.</li>
                </ul>

                <div className="bg-red-900/30 p-5 rounded-2xl border border-red-500/50 my-6">
                    <h3 className="text-red-200 mt-0 font-bold">4. Return & Refund Policy</h3>
                    
                    <h4 className="text-white font-bold mt-4 underline">A. Digital Products (E-books/PDF)</h4>
                    <p>For digital content (PDF), <span className="text-red-400 font-bold uppercase">NO REFUND</span> will be given, as they are accessible immediately after the link is generated.</p>

                    <h4 className="text-white font-bold mt-4 underline">B. Physical Products</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>24-Hour Reporting:</strong> Damaged or wrong items must be reported within 24 hours of delivery.</li>
                        <li><strong>Unboxing Video Mandatory:</strong> An <strong className="text-white">uncut unboxing video</strong> is mandatory for any replacement claim. No claim will be accepted without the video.</li>
                        <li><strong>Time Limit:</strong> The return or replacement option will automatically close after the 24-hour period expires.</li>
                    </ul>
                </div>

                <h3>5. Intellectual Property (Copyright)</h3>
                <p>All e-books and content available on the app are the property of "Ok-E-store". Reselling or illegal distribution for commercial purposes is strictly prohibited.</p>

                <h3>6. Legal Jurisdiction</h3>
                <p>In case of any dispute, judicial proceedings will be held only within the local court jurisdiction.</p>

                <div className="pt-6 border-t border-white/10 text-center">
                    <p className="text-purple-300">For assistance: Contact us in the app's <strong>'Support'</strong> section.</p>
                </div>
            </div>
            <div className="h-10"></div>
        </Card>
    );
};

export default TermsAndConditions;
