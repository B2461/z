
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile as firebaseUpdateProfile, sendPasswordResetEmail, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, initializeFirestore, setDoc, onSnapshot, limit, where, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
// Fix: ProductComment, ChatMessage, and SavedReading are now available in types.ts
import { Product, ProductComment, ChatMessage, UserProfile, Order, VerificationRequest, SupportTicket, SocialMediaPost, CartItem, Notification, SavedReading } from '../types';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with experimentalForceLongPolling to avoid "Could not reach Cloud Firestore backend" errors
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

// --- Auth & Profile ---
export const registerUser = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(userCredential.user, { displayName: name });
    const userRef = doc(db, 'users', userCredential.user.uid);
    const profileData = {
        name, email, uid: userCredential.user.uid, signupDate: new Date().toISOString(),
        isOnline: true, lastActive: serverTimestamp(), wishlist: [], cart: [], address: '', phone: '',
        downloadsConsumed: 0 // Initialize download count
    };
    await setDoc(userRef, profileData);
    return userCredential.user;
};

export const loginUser = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
};

// NEW: Change Password Directly In-App with Re-authentication
export const changeUserPassword = async (currentPassword: string, newPassword: string) => {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("User not authenticated");

    // 1. Re-authenticate user to ensure security
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 2. Update Password
    await updatePassword(user, newPassword);
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { uid: userSnap.id, ...userSnap.data() } as UserProfile : null;
};

export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
    try {
        const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            return { uid: snapshot.docs[0].id, ...docData } as UserProfile;
        }
        return null;
    } catch (e) {
        console.error("Error getting user by email:", e);
        return null;
    }
};

export const getUserByPhone = async (phone: string): Promise<UserProfile | null> => {
    try {
        const q = query(collection(db, 'users'), where('phone', '==', phone), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            return { uid: snapshot.docs[0].id, ...docData } as UserProfile;
        }
        return null;
    } catch (e) {
        console.error("Error getting user by phone:", e);
        return null;
    }
};

export const subscribeToUserProfile = (uid: string, callback: (profile: UserProfile | null) => void) => {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
        } else {
            callback(null);
        }
    });
};

export const saveUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { ...data, lastActive: serverTimestamp() }, { merge: true });
};

// NEW: Atomic Increment for Downloads
export const incrementUserDownloads = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        downloadsConsumed: increment(1),
        lastActive: serverTimestamp()
    });
};

// --- USER ACTIVITY TRACKING (NEW) ---
export const trackUserActivity = async (uid: string, viewName: string) => {
    const userRef = doc(db, 'users', uid);
    // Updates where the user currently is, for Admin visibility
    await updateDoc(userRef, { 
        currentView: viewName,
        lastActive: serverTimestamp(),
        isOnline: true
    });
};

// --- REAL-TIME CART & WISHLIST SYNC (NEW) ---
export const syncUserCart = async (uid: string, cartItems: CartItem[]) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { cart: cartItems });
};

export const syncUserWishlist = async (uid: string, wishlist: string[]) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { wishlist: wishlist });
};

// --- GLOBAL NOTIFICATIONS (NEW) ---
export const subscribeToGlobalNotifications = (callback: (notifications: Notification[]) => void) => {
    // Assuming a collection 'global_notifications' exists for admin alerts
    const q = query(collection(db, 'global_notifications'), orderBy('timestamp', 'desc'), limit(20));
    return onSnapshot(q, (snapshot) => {
        const notifs: Notification[] = [];
        snapshot.forEach((doc) => notifs.push({ id: doc.id, ...doc.data() } as Notification));
        callback(notifs);
    });
};

// --- SAVED READINGS (CLOUD SYNC FOR TOOLS) ---
export const addSavedReading = async (userId: string, reading: SavedReading) => {
    // We save readings in a subcollection under the user to keep data organized and secure
    // Using setDoc with reading.id ensures we don't create duplicates if clicked twice
    const readingRef = doc(db, 'users', userId, 'saved_readings', reading.id);
    await setDoc(readingRef, { ...reading, serverTimestamp: serverTimestamp() });
};

export const subscribeToUserReadings = (userId: string, callback: (readings: SavedReading[]) => void) => {
    const q = query(collection(db, 'users', userId, 'saved_readings'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const results: SavedReading[] = [];
        snapshot.forEach(doc => results.push(doc.data() as SavedReading));
        callback(results);
    });
};

export const deleteSavedReading = async (userId: string, readingId: string) => {
    await deleteDoc(doc(db, 'users', userId, 'saved_readings', readingId));
};

// --- Products CRUD ---
export const getFirestoreProducts = async (): Promise<Product[]> => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
};

// NEW: Real-time product subscription
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((doc) => {
            products.push({ ...doc.data(), id: doc.id } as Product);
        });
        callback(products);
    });
};

export const addFirestoreProduct = async (product: Omit<Product, 'id'>) => {
    const docRef = await addDoc(collection(db, 'products'), { ...product, createdAt: serverTimestamp() });
    return docRef.id;
};

export const updateFirestoreProduct = async (id: string, updates: Partial<Product>) => {
    // Changed from updateDoc to setDoc with merge: true
    // This allows updating products that might not exist in Firestore yet (static products)
    await setDoc(doc(db, 'products', id), updates, { merge: true });
};

export const deleteFirestoreProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
};

// --- Orders Management ---
export const addFirestoreOrder = async (order: Order) => {
    await setDoc(doc(db, 'orders', order.id), { ...order, createdAt: serverTimestamp() });
};

export const updateFirestoreOrder = async (id: string, updates: Partial<Order>) => {
    await updateDoc(doc(db, 'orders', id), updates);
};

export const subscribeToAllOrders = (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((doc) => orders.push({ ...doc.data(), id: doc.id } as Order));
        callback(orders);
    });
};

export const getUserOrders = async (email: string): Promise<Order[]> => {
    try {
        const q = query(collection(db, 'orders'), where('customer.email', '==', email));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
        return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
        console.error("Error fetching user orders:", e);
        return [];
    }
};

export const subscribeToUserOrders = (email: string, callback: (orders: Order[]) => void) => {
    const q = query(collection(db, 'orders'), where('customer.email', '==', email));
    return onSnapshot(q, (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((doc) => orders.push({ ...doc.data(), id: doc.id } as Order));
        orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(orders);
    });
};

// --- Verification Requests Management ---
export const addVerificationRequest = async (request: Omit<VerificationRequest, 'id'>) => {
    await addDoc(collection(db, 'verification_requests'), { ...request, createdAt: serverTimestamp() });
};

export const subscribeToVerificationRequests = (callback: (requests: VerificationRequest[]) => void) => {
    const q = query(collection(db, 'verification_requests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const requests: VerificationRequest[] = [];
        snapshot.forEach((doc) => requests.push({ ...doc.data(), id: doc.id } as VerificationRequest));
        callback(requests);
    });
};

export const deleteFirestoreVerification = async (id: string) => {
    await deleteDoc(doc(db, 'verification_requests', id));
};

// --- Support Tickets Management ---
export const addSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    await addDoc(collection(db, 'support_tickets'), { 
        ...ticket, 
        status: 'Open',
        createdAt: new Date().toISOString() 
    });
};

export const subscribeToSupportTickets = (callback: (tickets: SupportTicket[]) => void) => {
    const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const tickets: SupportTicket[] = [];
        snapshot.forEach((doc) => tickets.push({ ...doc.data(), id: doc.id } as SupportTicket));
        callback(tickets);
    });
};

// Updated signature to accept 'Refunded'
export const updateSupportTicketStatus = async (id: string, status: 'Open' | 'Closed' | 'Refunded') => {
    await updateDoc(doc(db, 'support_tickets', id), { status });
};

// --- Social Media Posts ---
export const addSocialPost = async (post: Omit<SocialMediaPost, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'social_media_posts'), { 
        ...post, 
        createdAt: new Date().toISOString() 
    });
};

export const subscribeToSocialPosts = (callback: (posts: SocialMediaPost[]) => void) => {
    const q = query(collection(db, 'social_media_posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const posts: SocialMediaPost[] = [];
        snapshot.forEach((doc) => posts.push({ ...doc.data(), id: doc.id } as SocialMediaPost));
        callback(posts);
    });
};

export const deleteSocialPost = async (id: string) => {
    await deleteDoc(doc(db, 'social_media_posts', id));
};

// --- Other Services ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);

export const subscribeToCommunityMessages = (callback: (messages: ChatMessage[]) => void) => {
    const q = query(collection(db, 'community_messages'), orderBy('createdAt', 'desc'), limit(150));
    return onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() } as ChatMessage));
        callback(messages);
    });
};

export const sendCommunityMessage = async (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'community_messages'), { ...message, createdAt: serverTimestamp() });
};

export const subscribeToAllUsers = (callback: (users: UserProfile[]) => void) => {
    const q = query(collection(db, 'users'), limit(500));
    return onSnapshot(q, (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((doc) => users.push(doc.data() as UserProfile));
        callback(users);
    });
};

export const subscribeToProductComments = (productId: string, callback: (comments: ProductComment[]) => void) => {
    const q = query(collection(db, 'products', productId, 'comments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const comments: ProductComment[] = [];
        snapshot.forEach((doc) => comments.push({ id: doc.id, ...doc.data() } as ProductComment));
        callback(comments);
    });
};

export const addProductComment = async (productId: string, comment: Omit<ProductComment, 'id'>) => {
    await addDoc(collection(db, 'products', productId, 'comments'), { ...comment, createdAt: serverTimestamp() });
};

export const updateUserOnlineStatus = async (uid: string, isOnline: boolean) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { isOnline, lastActive: serverTimestamp() });
};

export const syncUserLocation = async (uid: string, updates: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
};
