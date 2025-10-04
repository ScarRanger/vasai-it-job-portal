'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/services/firebase';
import { User } from '@/types';
import { Upload, Eye, EyeOff, Mail, Phone, FileText } from 'lucide-react';

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    if (!formData.addressProof) {
      newErrors.addressProof = 'Address proof document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (PDF, JPG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, addressProof: 'Please upload a PDF, JPG, or PNG file' });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, addressProof: 'File size must be less than 5MB' });
        return;
      }

      setFormData({ ...formData, addressProof: file });
      setErrors({ ...errors, addressProof: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // TODO: Upload address proof file to Firebase Storage
      // For now, we'll just pass the file name
      const addressProofUrl = formData.addressProof ? `uploads/${Date.now()}_${formData.addressProof.name}` : '';
      
      const userData: Partial<User> = {
        email: formData.email,
        phone: formData.phone,
        addressProof: addressProofUrl,
        userType,
        profileCompleted: false,
      };

      const firebaseUser = await authService.signUp(formData.email, formData.password, userData);
      
      // Create User object with proper types
      const user: User = {
        id: firebaseUser.uid,
        email: formData.email,
        phone: formData.phone,
        addressProof: addressProofUrl,
        userType,
        profileCompleted: false,
        createdAt: new Date(),
      };
      
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
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
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
                  <Label htmlFor="phone" className="text-white">
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
                  <Label htmlFor="password" className="text-white">Password</Label>
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
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
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

                {/* Address Proof Upload */}
                <div className="space-y-2">
                  <Label htmlFor="addressProof" className="text-white">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Address Proof Document
                  </Label>
                  <div className="relative">
                    <Input
                      id="addressProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="bg-input border-border text-foreground file:bg-muted file:text-foreground file:border-0"
                      required
                    />
                    <div className="absolute right-2 top-2">
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload Aadhar, Passport, or Utility Bill (PDF, JPG, PNG - Max 5MB)
                  </p>
                  {formData.addressProof && (
                    <p className="text-green-400 text-sm">
                      ✓ {formData.addressProof.name} selected
                    </p>
                  )}
                  {errors.addressProof && <p className="text-red-400 text-sm">{errors.addressProof}</p>}
                </div>

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