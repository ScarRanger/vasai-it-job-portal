import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, JobFinder, Company, Job, Application } from '@/types';

// Auth Services
export const authService = {
  async signUp(email: string, password: string, userData: Partial<User>) {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      id: user.uid,
      email: user.email,
      createdAt: Timestamp.now(),
    });

    return user;
  },

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signOut() {
    return signOut(auth);
  },

  async getCurrentUserData(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    return { id: user.uid, ...userDoc.data() } as User;
  },
};

// User Services
export const userService = {
  async getUserById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return { id: userId, ...userDoc.data() } as User;
  },

  async updateUser(userId: string, data: Partial<User>) {
    return updateDoc(doc(db, 'users', userId), data);
  },
};

// Job Services
export const jobService = {
  async createJob(jobData: Omit<Job, 'id' | 'postedAt'>) {
    return addDoc(collection(db, 'jobs'), {
      ...jobData,
      postedAt: Timestamp.now(),
    });
  },

  async getJobs(): Promise<Job[]> {
    const q = query(
      collection(db, 'jobs'),
      where('isActive', '==', true),
      orderBy('postedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
  },

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    const q = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId),
      orderBy('postedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
  },

  async getJobById(jobId: string): Promise<Job | null> {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) return null;
    return { id: jobId, ...jobDoc.data() } as Job;
  },

  async updateJob(jobId: string, data: Partial<Job>) {
    return updateDoc(doc(db, 'jobs', jobId), data);
  },

  async deleteJob(jobId: string) {
    return deleteDoc(doc(db, 'jobs', jobId));
  },
};

// Application Services
export const applicationService = {
  async applyForJob(applicationData: Omit<Application, 'id' | 'appliedAt' | 'status'>) {
    return addDoc(collection(db, 'applications'), {
      ...applicationData,
      appliedAt: Timestamp.now(),
      status: 'pending' as const,
    });
  },

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Application[];
  },

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    const q = query(
      collection(db, 'applications'),
      where('applicantId', '==', userId),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Application[];
  },

  async updateApplicationStatus(
    applicationId: string,
    status: Application['status']
  ) {
    return updateDoc(doc(db, 'applications', applicationId), { status });
  },

  async checkIfApplied(jobId: string, userId: string): Promise<boolean> {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('applicantId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },
};