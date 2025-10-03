import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Server-side service account configuration
const getServiceAccountConfig = () => {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountBase64) {
    console.warn('Firebase service account key not found. Using default credentials.');
    return null;
  }

  try {
    // Decode base64 service account key
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  } catch (error) {
    console.error('Error parsing service account key:', error);
    return null;
  }
};

// Initialize Firebase Admin safely
const initializeFirebaseAdmin = (): App => {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const serviceAccountConfig = getServiceAccountConfig();

  if (serviceAccountConfig) {
    return initializeApp({
      credential: cert(serviceAccountConfig),
      projectId: serviceAccountConfig.projectId,
    });
  } else {
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
};

// Ensure adminApp is always assigned
const adminApp: App = typeof window === 'undefined' ? initializeFirebaseAdmin() : ({} as App);

// Export admin services
export const adminDb = typeof window === 'undefined' ? getFirestore(adminApp) : null;
export const adminAuth = typeof window === 'undefined' ? getAuth(adminApp) : null;

export { adminApp };

// Utility function to verify user tokens on server-side
export const verifyIdToken = async (idToken: string) => {
  if (typeof window !== 'undefined' || !adminAuth) {
    throw new Error('This function can only be called server-side');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

// Utility function to get user data by UID
export const getUserByUid = async (uid: string) => {
  if (typeof window !== 'undefined' || !adminAuth) {
    throw new Error('This function can only be called server-side');
  }

  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export default adminApp;
