'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { jobService, applicationService } from '@/services/firebase';
import { Job, Application, User } from '@/types';
import { Search, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';

interface JobFinderDashboardProps {
  userData: User;
}

export default function JobFinderDashboard({ userData }: JobFinderDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [userData.id]);

  useEffect(() => {
    // Filter jobs based on search term
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredJobs(filtered);
  }, [jobs, searchTerm]);

  const fetchData = async () => {
    try {
      const [jobsData, applicationsData] = await Promise.all([
        jobService.getJobs(),
        applicationService.getApplicationsByUser(userData.id)
      ]);
      
      setJobs(jobsData);
      setApplications(applicationsData);
      
      // Create set of applied job IDs
      const appliedJobIds = new Set(applicationsData.map(app => app.jobId));
      setAppliedJobs(appliedJobIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleApply = async (job: Job) => {
    try {
      const applicationData = {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        applicantId: userData.id,
        applicantName: userData.name,
        applicantEmail: userData.email,
      };

      await applicationService.applyForJob(applicationData);
      
      // Update applied jobs set
      setAppliedJobs(prev => new Set(prev).add(job.id));
      
      // Update applications list
      fetchData();
      
      alert('Application submitted successfully!');
      setShowJobDetails(false);
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application. Please try again.');
    }
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

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const formatDate = (date: Date | { toDate: () => Date } | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
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
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Jobs Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Jobs</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-blue-600">{job.title}</h3>
                    <span className="text-sm text-gray-500">{formatDate(job.postedAt)}</span>
                  </div>
                  
                  <p className="text-gray-800 font-medium mb-2">{job.companyName}</p>
                  
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
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {job.description}
                  </p>

                  {appliedJobs.has(job.id) && (
                    <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Applied
                    </div>
                  )}
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No jobs found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">My Applications</h2>
            
            <div className="space-y-3">
              {applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-3">
                  <h4 className="font-semibold text-sm">{application.jobTitle}</h4>
                  <p className="text-gray-600 text-xs">{application.companyName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(application.appliedAt)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No applications yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedJob.companyName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedJob.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {selectedJob.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedJob.experience}
                    </div>
                  </div>
                </div>

                {selectedJob.salary && (
                  <div>
                    <h4 className="font-semibold mb-2">Salary</h4>
                    <p className="text-green-600 font-medium">{formatSalary(selectedJob.salary)}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Job Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {appliedJobs.has(selectedJob.id) ? (
                    <div className="flex-1 px-4 py-2 bg-green-100 text-green-800 text-center rounded-md">
                      Already Applied
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleApply(selectedJob)}
                      className="flex-1"
                    >
                      Apply Now
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowJobDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}