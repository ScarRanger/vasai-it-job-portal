'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/firebase';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (!loading && user && !isRedirecting && !checkingProfile) {
        setCheckingProfile(true);
        try {
          // Get user data from Firestore to check profile completion
          const userData = await userService.getUserById(user.uid);
          if (userData && userData.profileCompleted) {
            setProfileCompleted(true);
            setIsRedirecting(true);
            // Add a small delay to ensure the auth state is fully processed
            setTimeout(() => {
              router.push('/dashboard');
            }, 100);
          } else {
            // Profile not completed, stay on landing page
            setProfileCompleted(false);
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          // On error, assume profile not completed
          setProfileCompleted(false);
        } finally {
          setCheckingProfile(false);
        }
      }
    };

    checkProfileAndRedirect();
  }, [user, loading, router, isRedirecting, checkingProfile]);

  if (loading || checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            {loading ? 'Loading...' : 'Checking profile...'}
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated and profile is completed, show redirecting message
  if (user && profileCompleted === true && isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Show landing page for:
  // 1. Non-authenticated users
  // 2. Authenticated users with incomplete profiles
  return <LandingPage />;
}
