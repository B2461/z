
import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';

const PrivacyPolicy: React.FC = () => {
    const { t } = useAppContext();
    return (
        <Card className="animate-fade-in max-w-4xl mx-auto text-left mb-20">
            <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Privacy Policy</h2>

            <div className="space-y-6 text-purple-200 prose prose-invert prose-p:text-purple-200 prose-h3:text-white prose-h3:font-hindi prose-ul:text-purple-200 text-sm sm:text-base">
                <p className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs"><strong>Effective Date:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <p>"Ok-E-store" prioritizes your privacy. This policy explains how we collect, use, and protect your data.</p>

                <h3>1. Information We Collect</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Personal Information:</strong> Name, Email, Phone Number, and Shipping Address.</li>
                    <li><strong>Payment Data:</strong> Payment screenshots and Transaction IDs uploaded by you (for verification only).</li>
                </ul>

                <h3>2. Use of Data</h3>
                <p>We use your data solely to deliver your orders, verify payments, and provide support to you.</p>

                <h3>3. Data Security & Storage</h3>
                <p>Your data is stored on secure encrypted servers of <strong>Firebase (Google Cloud)</strong>. Your sensitive information is transmitted with SSL security.</p>

                <h3>4. Delete Account & User Rights</h3>
                <p>According to Google Play Store policy, you have full control over your data. You can permanently delete all your data from our servers using the <strong>'Delete Account'</strong> option in the app's <strong>'Profile'</strong> section.</p>

                <h3>5. Required Permissions</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Camera/Gallery:</strong> To upload payment screenshots and profile photos.</li>
                    <li><strong>Internet:</strong> To sync app data with the cloud.</li>
                </ul>

                <h3>6. Data Sharing</h3>
                <p>We do not sell your personal information to third parties. Your shipping data is shared only with our trusted courier partners.</p>

                <h3>7. Changes to Policy</h3>
                <p>We may update this policy from time to time. Significant changes will be notified via the app.</p>
                
                <div className="pt-6 border-t border-white/10 text-center">
                    <p className="text-sm">For any questions, contact us via our <strong>'Support'</strong> section.</p>
                </div>
            </div>
            <div className="h-10"></div>
        </Card>
    );
};

export default PrivacyPolicy;
