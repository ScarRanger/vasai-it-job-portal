'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/firebase';
import { useRouter } from 'next/navigation';
import { Briefcase, Users, Search, MapPin, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/theme-toggle';

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

    // Basic validation
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (authMode === 'signup' && !formData.name) {
      alert('Please enter your name.');
      setLoading(false);
      return;
    }

    if (authMode === 'signup' && userType === 'company' && !formData.companyName) {
      alert('Please enter your company name.');
      setLoading(false);
      return;
    }

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
      
      // Close the dialog first
      setShowAuth(false);
      
      // Don't navigate immediately - let the auth state change handle it
      // The useEffect in page.tsx will handle the redirect automatically
    } catch (error: unknown) {
      console.error('Auth error:', error);
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Type guard for Firebase error
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        
        if (firebaseError.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email. Please sign up first.';
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters long.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openAuth = (mode: 'login' | 'signup', type: UserType) => {
    setAuthMode(mode);
    setShowAuth(true);
    
    // Use setTimeout to ensure userType is set after dialog opens
    setTimeout(() => {
      setUserType(type);
    }, 0);
    
    // Reset form data when opening auth dialog
    setFormData({
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
  };

  const openSignup = () => {
    openAuth('signup', 'job_finder'); // Default to job_finder for general "Get Started" buttons
  };

  const features = [
    {
      icon: <Search className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Smart Job Search",
      description: "Find jobs that match your skills and preferences with our intelligent search algorithm."
    },
    {
      icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-success" />,
      title: "Connect with Companies",
      description: "Direct communication with hiring managers and companies in your area."
    },
    {
      icon: <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />,
      title: "Local Opportunities",
      description: "Focus on job opportunities in Vasai and surrounding areas."
    },
    {
      icon: <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-info" />,
      title: "Easy Application",
      description: "Apply to multiple jobs with one click using your profile information."
    }
  ];

  const stats = [
    { label: "Active Jobs", value: "500+", icon: Briefcase },
    { label: "Companies", value: "100+", icon: Users },
    { label: "Success Rate", value: "95%", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container-responsive">
          <div className="flex items-center justify-between py-4 md:py-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Vasai IT Jobs
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <SimpleThemeToggle />
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openAuth('login', 'job_finder')}
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={() => openSignup()}
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Join</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container-responsive">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Find Your Dream Job in{' '}
                <span className="text-primary">Vasai</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect talented job seekers with innovative companies. 
                Whether you&apos;re looking for your next opportunity or seeking the perfect candidate, we&apos;ve got you covered.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 py-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-5 w-5 text-primary mr-2" />
                    <span className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* CTA Cards */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mt-12">
              <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl mb-2">For Job Seekers</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Discover exciting career opportunities and connect with top companies in your area.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full group"
                    onClick={() => openAuth('signup', 'job_finder')}
                  >
                    Find Jobs
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto">
                    <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-success group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl mb-2">For Companies</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Post jobs and find the perfect candidates for your team with our powerful platform.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full group"
                    variant="outline"
                    onClick={() => openAuth('signup', 'company')}
                  >
                    Post Jobs
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container-responsive">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Vasai IT Jobs?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              We&apos;re dedicated to connecting local talent with opportunities and helping businesses grow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary/5">
        <div className="container-responsive text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Join hundreds of job seekers and companies already using our platform to build successful careers and teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => openSignup()}
              >
                Join Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => openAuth('login', 'job_finder')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="w-[95vw] max-w-md" key={`dialog-${authMode}-${userType}`}>
          <DialogHeader>
            <DialogTitle className="text-center">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {authMode === 'login' 
                ? 'Sign in to your account to continue' 
                : `Welcome! Create your ${userType === 'job_finder' ? 'job seeker' : 'company'} account to get started`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div className="p-1 bg-muted rounded-lg grid grid-cols-2 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserType('job_finder')}
                  className={`transition-all duration-200 font-medium ${
                    userType === 'job_finder' 
                      ? 'bg-background text-foreground shadow-sm border border-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  👨‍💼 Job Seeker
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserType('company')}
                  className={`transition-all duration-200 font-medium ${
                    userType === 'company' 
                      ? 'bg-background text-foreground shadow-sm border border-border' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  🏢 Company
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
              <div className="space-y-4">
                <Input
                  placeholder={userType === 'company' ? 'Contact Person Name' : 'Full Name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                {userType === 'company' ? (
                  <div className="space-y-4">
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
                  </div>
                ) : (
                  <div className="space-y-4">
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
                  </div>
                )}

                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
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