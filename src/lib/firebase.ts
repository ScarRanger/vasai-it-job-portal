// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

// Check if we have the required environment variables
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Client-side Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id'
};

// Initialize Firebase (client-side only)
let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Only set up emulators if we don't have proper config and we're in development
if (!hasFirebaseConfig && process.env.NODE_ENV === 'development') {
  console.warn('Firebase config not found. Using demo mode. Please set up environment variables for production.');
  
  try {
    // Only connect to emulators if not already connected
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch {
    // Auth emulator might not be running or already connected
    console.log('Auth emulator not available');
  }
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch {
    // Firestore emulator might not be running or already connected
    console.log('Firestore emulator not available');
  }
}

export { auth, db };
export default app;