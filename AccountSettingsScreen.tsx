
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';

const AccountSettingsScreen: React.FC = () => {
    const { currentUser, updateProfile } = useAppContext() as any;
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || '',
        city: currentUser?.city || '',
        pincode: currentUser?.pincode || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile(formData);
            alert("जानकारी सफलतापूर्वक सेव हो गई!");
            navigate('/profile');
        } catch (err) {
            alert("सेव करने में त्रुटि हुई।");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto animate-fade-in pb-24 text-left">
            <button onClick={() => navigate('/profile')} className="text-purple-300 font-bold mb-6">&larr; वापस</button>
            <h2 className="text-2xl font-black text-white mb-6">Account Setting</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase">Your Name</label>
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase">Phone Number</label>
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase">Full Address</label>
                    <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">City</label>
                        <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase">Pincode</label>
                        <input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-500" />
                    </div>
                </div>
                
                <button type="submit" disabled={isSaving} className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">
                    {isSaving ? 'Saving...' : 'SAVE INFORMATION'}
                </button>
            </form>
        </Card>
    );
};

export default AccountSettingsScreen;
