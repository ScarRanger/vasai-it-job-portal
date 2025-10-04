'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { jobService, applicationService } from '@/services/firebase';
import { Job, Application, User } from '@/types';
import { Plus, MapPin, Clock, DollarSign, Briefcase, Users, Eye, X, Calendar } from 'lucide-react';

interface CompanyDashboardProps {
  userData: User;
}

export default function CompanyDashboard({ userData }: CompanyDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    location: '',
    type: 'full-time' as Job['type'],
    salary: {
      min: 0,
      max: 0,
      currency: 'INR'
    },
    skills: [''],
    experience: '',
    deadline: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const jobsData = await jobService.getJobsByCompany(userData.id);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userData.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData: Omit<Job, 'id' | 'postedAt'> = {
        companyId: userData.id,
        companyName: userData.name || 'Unknown Company',
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        location: formData.location,
        type: formData.type,
        salary: formData.salary.min > 0 ? formData.salary : undefined,
        skills: formData.skills.filter(skill => skill.trim() !== ''),
        experience: formData.experience,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        isActive: true,
      };

      await jobService.createJob(jobData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: [''],
        location: '',
        type: 'full-time',
        salary: { min: 0, max: 0, currency: 'INR' },
        skills: [''],
        experience: '',
        deadline: '',
      });
      
      setShowCreateJob(false);
      fetchData();
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    }
  };

  const handleViewApplications = async (jobId: string) => {
    try {
      const applicationsData = await applicationService.getApplicationsByJob(jobId);
      setJobApplications(applicationsData);
      setSelectedJobId(jobId);
      setShowApplications(true);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status);
      // Refresh applications
      if (selectedJobId) {
        handleViewApplications(selectedJobId);
      }
      alert('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status.');
    }
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: updatedRequirements
    });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewing': return 'info';
      case 'shortlisted': return 'success';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (date: Date | { toDate: () => Date } | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {userData.name}
          </h1>
          <p className="text-muted-foreground">
            Manage your job postings and applications
          </p>
        </div>
        <Button onClick={() => setShowCreateJob(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(job => job.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently accepting applications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all job postings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              Including inactive listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Posted Jobs</CardTitle>
              <CardDescription>
                View and manage your job postings
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateJob(true)} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Start by posting your first job opening to attract talented candidates
              </p>
              <Button onClick={() => setShowCreateJob(true)}>
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-primary">
                          {job.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatSalary(job.salary)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Posted {formatDate(job.postedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge variant={job.isActive ? 'success' : 'secondary'}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApplications(job.id)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          View Applications
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Job Dialog */}
      <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>
              Create a new job posting to attract qualified candidates to your company.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateJob} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Job Title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Textarea
                label="Job Description"
                placeholder="Describe the role, responsibilities, and what makes your company great..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Requirements</label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g. Bachelor's degree in Computer Science"
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      disabled={formData.requirements.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addRequirement} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Required Skills</label>
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g. React, Node.js, TypeScript"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSkill(index)}
                      disabled={formData.skills.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="e.g. Vasai, Mumbai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Job Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Job['type'] })}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <Input
                label="Experience Required"
                placeholder="e.g. 2-5 years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Salary Range (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    placeholder="Min Salary"
                    value={formData.salary.min || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      salary: { ...formData.salary, min: parseInt(e.target.value) || 0 }
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Max Salary"
                    value={formData.salary.max || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      salary: { ...formData.salary, max: parseInt(e.target.value) || 0 }
                    })}
                  />
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.salary.currency}
                    onChange={(e) => setFormData({
                      ...formData,
                      salary: { ...formData.salary, currency: e.target.value }
                    })}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Application Deadline (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1">
                Post Job
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateJob(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog open={showApplications} onOpenChange={setShowApplications}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Applications</DialogTitle>
            <DialogDescription>
              Review and manage applications for your job postings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {jobApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No applications yet</h3>
                <p className="text-muted-foreground">
                  Applications will appear here once candidates start applying
                </p>
              </div>
            ) : (
              jobApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{application.applicantName}</CardTitle>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">{application.applicantEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied on {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {application.coverLetter && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Cover Letter</h5>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'reviewing')}
                        disabled={application.status === 'reviewing'}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'shortlisted')}
                        disabled={application.status === 'shortlisted'}
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                        disabled={application.status === 'rejected'}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'hired')}
                        disabled={application.status === 'hired'}
                      >
                        Hire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}