
import { DivinationType } from '../types';

export interface Tool {
    type: DivinationType;
    icon: string;
    isPremium?: boolean;
}

export interface ToolCategory {
    name: string;
    tools: Tool[];
}

// ShowcaseTool interface to support attractive marketing content
export interface ShowcaseTool {
    type: DivinationType;
    icon: string;
    description: string;
    descriptionHi: string;
    motivationalText: string;
    motivationalTextHi?: string;
    imageUrl?: string;
}

export const toolCategories: ToolCategory[] = [
    {
        name: 'शॉपिंग स्टोर (Shopping Store)',
        tools: [
            { type: DivinationType.PUJAN_SAMAGRI, icon: '🕉️' },
            { type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK, icon: '📚' },
            { type: DivinationType.GEMS_JEWELRY, icon: '💎' },
            { type: DivinationType.MOBILE_ACCESSORIES, icon: '📱' },
            { type: DivinationType.LADIES_GENTS_BABY_SHOES, icon: '👟' },
            { type: DivinationType.LADIES_GENTS_ACCESSORIES, icon: '👜' },
        ]
    },
    {
        name: 'कोर्स और ज्ञान (Courses & Skills)',
        tools: [
            { type: DivinationType.COMPUTER_COURSE, icon: '💻' },
            { type: DivinationType.MOBILE_REPAIRING_COURSE, icon: '🛠️' },
            { type: DivinationType.SKILL_LEARNING, icon: '🚀' },
        ]
    },
    {
        name: 'मनोरंजन (Stories)',
        tools: [
            { type: DivinationType.BUSINESS_MOTIVATION, icon: '💼' },
            { type: DivinationType.AUDIO_STORY, icon: '🎧' },
        ]
    }
];

// Expanded showcaseTools to cover all major categories with attractive marketing text
export const showcaseTools: ShowcaseTool[] = [
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '📚',
        description: 'Secret Tantra Mantra PDF E-books Collection',
        descriptionHi: 'प्राचीन तंत्र मंत्र यंत्र PDF ई-बुक्स का गुप्त खजाना',
        motivationalText: 'Unlock Ancient Wisdom Now',
        motivationalTextHi: 'प्राचीन रहस्यों को अभी अनलॉक करें',
    },
    {
        type: DivinationType.MOBILE_ACCESSORIES,
        icon: '🎧',
        description: 'Premium Wireless Earbuds & Mobile Gadgets',
        descriptionHi: 'प्रीमियम वायरलेस इयरबड्स और लेटेस्ट मोबाइल गैजेट्स',
        motivationalText: 'Unbeatable Sound Quality',
        motivationalTextHi: 'बेहतरीन साउंड, भारी डिस्काउंट',
    },
    {
        type: DivinationType.PUJAN_SAMAGRI,
        icon: '🕉️',
        description: 'Pure Vedic Pujan Samagri for Every Ritual',
        descriptionHi: 'हर अनुष्ठान के लिए शुद्ध और सात्विक पूजन सामग्री',
        motivationalText: 'Bring Divine Blessings Home',
        motivationalTextHi: 'घर लाएं दैवीय आशीर्वाद और सकारात्मकता',
    },
    {
        type: DivinationType.GEMS_JEWELRY,
        icon: '💎',
        description: '100% Certified Astrological Gemstones',
        descriptionHi: 'ज्योतिष के अनुसार 100% असली और प्राण प्रतिष्ठित रत्न',
        motivationalText: 'Change Your Luck Today',
        motivationalTextHi: 'अपनी किस्मत का सितारा चमकाएं',
    },
    {
        type: DivinationType.LADIES_GENTS_BABY_SHOES,
        icon: '👞',
        description: 'Trendy Footwear Collection for the Family',
        descriptionHi: 'पूरे परिवार के लिए स्टाइलिश और मजबूत जूतों का संग्रह',
        motivationalText: 'Step into Comfort & Style',
        motivationalTextHi: 'आराम और स्टाइल के साथ कदम बढ़ाएं',
    },
    {
        type: DivinationType.COMPUTER_COURSE,
        icon: '💻',
        description: 'Professional Computer Courses: Basic to Advance',
        descriptionHi: 'प्रोफेशनल कंप्यूटर कोर्स: बेसिक से एडवांस लेवल तक',
        motivationalText: 'Build a Successful Career',
        motivationalTextHi: 'आज ही सीखें और अपना करियर बनाएं',
    },
    {
        type: DivinationType.MOBILE_REPAIRING_COURSE,
        icon: '🛠️',
        description: 'Master Mobile Repairing & Start Your Shop',
        descriptionHi: 'मोबाइल रिपेयरिंग मास्टर कोर्स और खुद की दुकान शुरू करें',
        motivationalText: 'Skill for Independent Future',
        motivationalTextHi: 'आत्मनिर्भर बनने का सुनहरा मौका',
    },
    {
        type: DivinationType.LADIES_GENTS_ACCESSORIES,
        icon: '👜',
        description: 'Luxury Bags, Belts & Premium Accessories',
        descriptionHi: 'प्रीमियम लेडीज बैग्स, जेंट्स बेल्ट और एक्सेसरीज',
        motivationalText: 'Refine Your Personality',
        motivationalTextHi: 'अपनी पर्सनालिटी को दें नया लुक',
    }
];
