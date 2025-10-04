'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/firebase';
import LoginForm from './LoginForm';
import InitialRegistrationForm from './InitialRegistrationForm';
import ProfileCompletionForm from './ProfileCompletionForm';
import type { User } from '@/types';

export default function AuthFlow() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'complete-profile'>('login');
  const [userData, setUserData] = useState<User | null>(null);
  const [checkingAuthUser, setCheckingAuthUser] = useState(false);

  // Check if authenticated user needs to complete profile
  useEffect(() => {
    const checkAuthenticatedUserProfile = async () => {
      if (user && !loading && !checkingAuthUser) {
        setCheckingAuthUser(true);
        try {
          const userDoc = await userService.getUserById(user.uid);
          if (userDoc && !userDoc.profileCompleted) {
            setUserData(userDoc);
            setCurrentView('complete-profile');
          }
        } catch (error) {
          console.error('Error checking authenticated user profile:', error);
        } finally {
          setCheckingAuthUser(false);
        }
      }
    };

    checkAuthenticatedUserProfile();
  }, [user, loading]);

  const handleLoginSuccess = () => {
    // Login successful, let the main page handle profile checking and redirection
    // No immediate redirect here since we need to check profile completion first
  };

  const handleRegistrationSuccess = (newUser: User) => {
    setUserData(newUser);
    setCurrentView('complete-profile');
  };

  const handleProfileCompleted = () => {
    // Profile completed, redirect to dashboard
    router.push('/dashboard');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  // Show loading if we're checking authenticated user's profile
  if (user && checkingAuthUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case 'register':
      return (
        <InitialRegistrationForm
          onRegistrationSuccess={handleRegistrationSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      );
    
    case 'complete-profile':
      return userData ? (
        <ProfileCompletionForm
          user={userData}
          onProfileCompleted={handleProfileCompleted}
        />
      ) : null;
    
    case 'login':
    default:
      return (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      );
  }
}