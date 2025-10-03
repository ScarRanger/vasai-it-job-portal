'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { jobService, applicationService } from '@/services/firebase';
import { Job, Application, User } from '@/types';
import { Plus, MapPin, Clock, DollarSign, Briefcase, Users, Eye } from 'lucide-react';

interface CompanyDashboardProps {
  userData: User;
}

export default function CompanyDashboard({ userData }: CompanyDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
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

  useEffect(() => {
    fetchData();
  }, [userData.id]);

  const fetchData = async () => {
    try {
      const jobsData = await jobService.getJobsByCompany(userData.id);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const jobData: Omit<Job, 'id' | 'postedAt'> = {
        companyId: userData.id,
        companyName: userData.name,
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

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      case 'shortlisted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'hired': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.isActive).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs Posted</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Posted Jobs</h2>
            <Button onClick={() => setShowCreateJob(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>

        <div className="p-6">
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
              <Button onClick={() => setShowCreateJob(true)}>
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-blue-600">{job.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApplications(job.id)}
                      >
                        View Applications
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salary)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted {formatDate(job.postedAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Job Dialog */}
      <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateJob} className="space-y-4">
            <Input
              placeholder="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Textarea
              placeholder="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">Requirements</label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Requirement"
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRequirement}>
                Add Requirement
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSkill}>
                Add Skill
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Job['type'] })}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <Input
              placeholder="Experience Required"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              required
            />

            <div className="grid grid-cols-3 gap-4">
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

            <Input
              type="date"
              placeholder="Application Deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Post Job
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateJob(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Applications Dialog */}
      <Dialog open={showApplications} onOpenChange={setShowApplications}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Applications</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {jobApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No applications for this job yet.
              </div>
            ) : (
              jobApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{application.applicantName}</h4>
                      <p className="text-gray-600 text-sm">{application.applicantEmail}</p>
                      <p className="text-gray-500 text-xs">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  {application.coverLetter && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-1">Cover Letter</h5>
                      <p className="text-gray-700 text-sm">{application.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateApplicationStatus(application.id, 'reviewing')}
                      disabled={application.status === 'reviewing'}
                    >
                      Mark as Reviewing
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
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}