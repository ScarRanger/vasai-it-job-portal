'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/services/firebase';
import { User, JobFinder, Company } from '@/types';
import { Upload, Plus, X, User as UserIcon, Building, FileText, MapPin } from 'lucide-react';

interface ProfileCompletionFormProps {
  user: User;
  onProfileCompleted: (updatedUser: User) => void;
}

export default function ProfileCompletionForm({ user, onProfileCompleted }: ProfileCompletionFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Job Finder specific state
  const [jobFinderData, setJobFinderData] = useState({
    name: '',
    experience: '',
    location: '',
    skills: [''],
    resume: null as File | null,
  });

  // Company specific state
  const [companyData, setCompanyData] = useState({
    companyName: '',
    contactPersonName: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    size: '',
  });

  const addSkill = () => {
    setJobFinderData({
      ...jobFinderData,
      skills: [...jobFinderData.skills, '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const updatedSkills = [...jobFinderData.skills];
    updatedSkills[index] = value;
    setJobFinderData({
      ...jobFinderData,
      skills: updatedSkills
    });
  };

  const removeSkill = (index: number) => {
    if (jobFinderData.skills.length > 1) {
      setJobFinderData({
        ...jobFinderData,
        skills: jobFinderData.skills.filter((_, i) => i !== index)
      });
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (PDF only for resume)
      if (file.type !== 'application/pdf') {
        setErrors({ ...errors, resume: 'Please upload a PDF file' });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, resume: 'File size must be less than 10MB' });
        return;
      }

      setJobFinderData({ ...jobFinderData, resume: file });
      setErrors({ ...errors, resume: '' });
    }
  };

  const validateJobFinderForm = () => {
    const newErrors: Record<string, string> = {};

    if (!jobFinderData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!jobFinderData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!jobFinderData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    const validSkills = jobFinderData.skills.filter(skill => skill.trim() !== '');
    if (validSkills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    if (!jobFinderData.resume) {
      newErrors.resume = 'Resume upload is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompanyForm = () => {
    const newErrors: Record<string, string> = {};

    if (!companyData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!companyData.contactPersonName.trim()) {
      newErrors.contactPersonName = 'Contact person name is required';
    }

    if (!companyData.description.trim()) {
      newErrors.description = 'Company description is required';
    }

    if (!companyData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!companyData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    if (!companyData.size.trim()) {
      newErrors.size = 'Company size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = user.userType === 'job_finder' 
      ? validateJobFinderForm() 
      : validateCompanyForm();
    
    if (!isValid) return;
    
    setLoading(true);
    
    try {
      let updatedUserData: Partial<User>;

      if (user.userType === 'job_finder') {
        // TODO: Upload resume to Firebase Storage
        const resumeUrl = jobFinderData.resume ? `resumes/${Date.now()}_${jobFinderData.resume.name}` : '';
        
        updatedUserData = {
          name: jobFinderData.name,
          experience: jobFinderData.experience,
          location: jobFinderData.location,
          skills: jobFinderData.skills.filter(skill => skill.trim() !== ''),
          resume: resumeUrl,
          profileCompleted: true,
        } as Partial<JobFinder>;
      } else {
        updatedUserData = {
          companyName: companyData.companyName,
          contactPersonName: companyData.contactPersonName,
          description: companyData.description,
          website: companyData.website,
          location: companyData.location,
          industry: companyData.industry,
          size: companyData.size,
          profileCompleted: true,
        } as Partial<Company>;
      }

      await userService.updateUser(user.id, updatedUserData);
      
      const completedUser: User = {
        ...user,
        ...updatedUserData,
      };
      
      onProfileCompleted(completedUser);
    } catch (error) {
      console.error('Profile completion error:', error);
      setErrors({ submit: 'Failed to complete profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Step 2 of 2 - {user.userType === 'job_finder' ? 'Job Seeker' : 'Company'} Information
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {user.userType === 'job_finder' ? (
              // Job Finder Form
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <UserIcon className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={jobFinderData.name}
                    onChange={(e) => setJobFinderData({ ...jobFinderData, name: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-foreground">Experience Level</Label>
                  <Input
                    id="experience"
                    placeholder="e.g., 2 years, Fresher, 5+ years"
                    value={jobFinderData.experience}
                    onChange={(e) => setJobFinderData({ ...jobFinderData, experience: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.experience && <p className="text-red-400 text-sm">{errors.experience}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Vasai, Mumbai, Remote"
                    value={jobFinderData.location}
                    onChange={(e) => setJobFinderData({ ...jobFinderData, location: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label className="text-foreground">Skills & Technologies</Label>
                  {jobFinderData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., React, Node.js, Python"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="bg-input border-border text-foreground"
                      />
                      {jobFinderData.skills.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSkill(index)}
                          className="border-border text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    className="w-full border-border text-muted-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                  {errors.skills && <p className="text-red-400 text-sm">{errors.skills}</p>}
                </div>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-foreground">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Resume Upload
                  </Label>
                  <div className="relative">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="bg-input border-border text-foreground file:bg-muted file:text-foreground file:border-0"
                      required
                    />
                    <div className="absolute right-2 top-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your resume in PDF format (Max 10MB)
                  </p>
                  {jobFinderData.resume && (
                    <p className="text-green-400 text-sm">
                      âœ“ {jobFinderData.resume.name} selected
                    </p>
                  )}
                  {errors.resume && <p className="text-red-400 text-sm">{errors.resume}</p>}
                </div>
              </div>
            ) : (
              // Company Form
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Building className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Company Information</h3>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-foreground">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.companyName && <p className="text-red-400 text-sm">{errors.companyName}</p>}
                </div>

                {/* Contact Person */}
                <div className="space-y-2">
                  <Label htmlFor="contactPersonName" className="text-foreground">Contact Person Name</Label>
                  <Input
                    id="contactPersonName"
                    placeholder="HR/Manager name"
                    value={companyData.contactPersonName}
                    onChange={(e) => setCompanyData({ ...companyData, contactPersonName: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.contactPersonName && <p className="text-red-400 text-sm">{errors.contactPersonName}</p>}
                </div>

                {/* Company Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Company Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your company..."
                    value={companyData.description}
                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                    className="bg-input border-border text-foreground"
                    rows={3}
                    required
                  />
                  {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-foreground">Website (Optional)</Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="companyLocation" className="text-foreground">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="companyLocation"
                    placeholder="e.g., Vasai, Mumbai"
                    value={companyData.location}
                    onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-foreground">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={companyData.industry}
                    onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                    className="bg-input border-border text-foreground"
                    required
                  />
                  {errors.industry && <p className="text-red-400 text-sm">{errors.industry}</p>}
                </div>

                {/* Company Size */}
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-foreground">Company Size</Label>
                  <select
                    id="size"
                    value={companyData.size}
                    onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-border bg-input text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  {errors.size && <p className="text-red-400 text-sm">{errors.size}</p>}
                </div>
              </div>
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
              {loading ? 'Completing Profile...' : 'Complete Profile & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
