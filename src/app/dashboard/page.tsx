'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/firebase';
import { User } from '@/types';
import JobFinderDashboard from '@/components/JobFinderDashboard';
import CompanyDashboard from '@/components/CompanyDashboard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchUserData();
    }
  }, [user, loading, router]);

  const fetchUserData = async () => {
    try {
      const data = await authService.getCurrentUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || loadingUserData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading user data</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome, {userData.name}
              </h1>
              <p className="text-gray-300">
                {userData.userType === 'company' ? 'Company Dashboard' : 'Job Seeker Dashboard'}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      {userData.userType === 'job_finder' ? (
        <JobFinderDashboard userData={userData} />
      ) : (
        <CompanyDashboard userData={userData} />
      )}
    </div>
  );
}