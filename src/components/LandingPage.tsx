'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Search, MapPin, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { SimpleThemeToggle } from '@/components/theme-toggle';
import AuthFlow from './AuthFlow';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthFlow />;
  }

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                onClick={() => setShowAuth(true)}
              >
                Login
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowAuth(true)}
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Find Your Dream Job in{' '}
              <span className="text-primary">Vasai IT Sector</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with top IT companies and discover exciting career opportunities 
              in Vasai&apos;s growing technology hub.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6"
                onClick={() => setShowAuth(true)}
              >
                Find Jobs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6"
                onClick={() => setShowAuth(true)}
              >
                Post a Job
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Vasai IT Jobs?
            </h3>
            <p className="text-lg text-muted-foreground">
              We&apos;re more than just a job board - we&apos;re your career partner in the IT industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-border bg-card">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-card-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Your IT Career?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals who have found their perfect job through our platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Card className="p-6 border-border bg-card">
                <div className="text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-card-foreground mb-2">
                    For Job Seekers
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Create your profile and get discovered by top companies.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setShowAuth(true)}
                  >
                    Create Profile
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 border-border bg-card">
                <div className="text-center">
                  <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-card-foreground mb-2">
                    For Companies
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Find the best talent for your growing business.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAuth(true)}
                  >
                    Post Jobs
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Vasai IT Jobs
              </span>
            </div>
            <p className="text-muted-foreground text-center sm:text-right">
              © 2025 Vasai IT Jobs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}