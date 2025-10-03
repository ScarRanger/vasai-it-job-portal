'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/firebase';
import { useRouter } from 'next/navigation';
import { Briefcase, Users, Search, MapPin, CheckCircle } from 'lucide-react';

type UserType = 'job_finder' | 'company';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<UserType>('job_finder');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    description: '',
    location: '',
    industry: '',
    size: '',
    skills: '',
    experience: '',
    phone: '',
  });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const userData = {
          name: formData.name,
          userType,
          ...(userType === 'company' ? {
            companyName: formData.companyName,
            description: formData.description,
            location: formData.location,
            industry: formData.industry,
            size: formData.size,
          } : {
            location: formData.location,
            skills: formData.skills.split(',').map(s => s.trim()),
            experience: formData.experience,
            phone: formData.phone,
          }),
        };
        await authService.signUp(formData.email, formData.password, userData);
      } else {
        await authService.signIn(formData.email, formData.password);
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (mode: 'login' | 'signup', type: UserType) => {
    setAuthMode(mode);
    setUserType(type);
    setShowAuth(true);
  };

  const features = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Smart Job Search",
      description: "Find jobs that match your skills and preferences with our intelligent search algorithm."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Connect with Companies",
      description: "Direct communication with hiring managers and companies in your area."
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-600" />,
      title: "Local Opportunities",
      description: "Focus on job opportunities in Vasai and surrounding areas."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-orange-600" />,
      title: "Easy Application",
      description: "Apply to multiple jobs with one click using your profile information."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">Vasai IT Jobs</h1>
            </div>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => openAuth('login', 'job_finder')}>
                Login
              </Button>
              <Button onClick={() => setShowAuth(true)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Find Your Dream Job in <span className="text-blue-400">Vasai</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Connect talented job seekers with innovative companies. 
            Whether you&apos;re looking for your next opportunity or seeking the perfect candidate, we&apos;ve got you covered.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-700">
              <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-white">For Job Seekers</h3>
              <p className="text-gray-300 mb-6">
                Discover exciting career opportunities and connect with top companies in your area.
              </p>
              <Button 
                className="w-full" 
                onClick={() => openAuth('signup', 'job_finder')}
              >
                Find Jobs
              </Button>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-700">
              <Briefcase className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-white">For Companies</h3>
              <p className="text-gray-300 mb-6">
                Post jobs and find the perfect candidates for your team with our powerful platform.
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => openAuth('signup', 'company')}
              >
                Post Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Vasai IT Jobs?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We&apos;re dedicated to connecting local talent with opportunities and helping businesses grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of job seekers and companies already using our platform to build successful careers and teams.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowAuth(true)}
          >
            Join Today
          </Button>
        </div>
      </section>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={userType === 'job_finder' ? 'default' : 'outline'}
                  onClick={() => setUserType('job_finder')}
                >
                  Job Seeker
                </Button>
                <Button
                  type="button"
                  variant={userType === 'company' ? 'default' : 'outline'}
                  onClick={() => setUserType('company')}
                >
                  Company
                </Button>
              </div>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {authMode === 'signup' && (
              <>
                <Input
                  placeholder={userType === 'company' ? 'Contact Person Name' : 'Full Name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                {userType === 'company' ? (
                  <>
                    <Input
                      placeholder="Company Name"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Company Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Company Size (e.g., 10-50 employees)"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      required
                    />
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Skills (comma separated)"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Experience Level"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </>
                )}

                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}