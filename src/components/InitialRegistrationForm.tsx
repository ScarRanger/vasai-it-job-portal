'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/services/firebase';
import { User } from '@/types';
import { Eye, EyeOff, Mail, Phone, UserIcon } from 'lucide-react';
import FileUploadWithOCR from './FileUploadWithOCR';

interface InitialRegistrationFormProps {
  onRegistrationSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export default function InitialRegistrationForm({ 
  onRegistrationSuccess, 
  onSwitchToLogin 
}: InitialRegistrationFormProps) {
  const [userType, setUserType] = useState<'job_finder' | 'company'>('job_finder');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    addressProof: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressVerificationResult, setAddressVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    foundLocations?: string[];
  } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name should only contain letters and spaces';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Address proof is only required for job seekers
    if (userType === 'job_finder') {
      if (!formData.addressProof) {
        newErrors.addressProof = 'Address proof document is required for job seekers';
      } else if (!addressVerificationResult?.isValid) {
        newErrors.addressProof = 'Address verification failed. Please upload a valid address proof from Vasai region.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Only upload address proof for job seekers
      const addressProofUrl = (userType === 'job_finder' && formData.addressProof) 
        ? `uploads/${Date.now()}_${formData.addressProof.name}` 
        : undefined;
      
      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userType,
        profileCompleted: false,
      };

      // Add job finder specific fields only if user is a job finder
      if (userType === 'job_finder') {
        userData.addressProof = addressProofUrl;
        userData.addressVerified = addressVerificationResult?.isValid || false;
        
        // Only add addressVerificationError if there is an error
        if (!addressVerificationResult?.isValid && addressVerificationResult?.message) {
          userData.addressVerificationError = addressVerificationResult.message;
        }
      }

      const firebaseUser = await authService.signUp(formData.email, formData.password, userData);
      
      // Create User object with proper types
      const user: User = {
        id: firebaseUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userType,
        profileCompleted: false,
        createdAt: new Date(),
      };

      // Add job finder specific fields to the user object
      if (userType === 'job_finder') {
        user.addressProof = addressProofUrl;
        user.addressVerified = addressVerificationResult?.isValid || false;
        
        // Only add addressVerificationError if there is an error
        if (!addressVerificationResult?.isValid && addressVerificationResult?.message) {
          user.addressVerificationError = addressVerificationResult.message;
        }
      }
      
      onRegistrationSuccess(user);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          default:
            errorMessage = `Registration failed: ${firebaseError.message}`;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join Vasai IT Job Portal - Step 1 of 2
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'job_finder' | 'company')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="job_finder">Job Seeker</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>

            <TabsContent value={userType}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    <UserIcon className="w-4 h-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-input border-border text-foreground pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="bg-input border-border text-foreground pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                </div>

                {/* Address Proof Upload - Only for Job Seekers */}
                {userType === 'job_finder' && (
                  <FileUploadWithOCR
                    onFileVerified={(result) => {
                      setFormData({ ...formData, addressProof: result.file });
                      setAddressVerificationResult(result);
                      if (!result.isValid) {
                        setErrors({ ...errors, addressProof: result.message });
                      } else {
                        setErrors({ ...errors, addressProof: '' });
                      }
                    }}
                    userName={formData.name}
                    disabled={loading}
                  />
                )}

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Switch to Login */}
                <div className="text-center pt-4">
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <Button 
                      type="button"
                      variant="link" 
                      className="text-primary hover:text-primary/80 p-0"
                      onClick={onSwitchToLogin}
                    >
                      Sign in here
                    </Button>
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}