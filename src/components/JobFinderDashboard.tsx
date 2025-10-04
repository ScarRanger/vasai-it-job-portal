'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { jobService, applicationService } from '@/services/firebase';
import { Job, Application, User } from '@/types';
import { Search, MapPin, Clock, DollarSign, Briefcase, Filter, CheckCircle, Building, Calendar } from 'lucide-react';

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
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = useCallback(async () => {
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
  }, [userData.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Filter jobs based on search term and type
    let filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.type === filterType);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterType]);

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
        applicantName: userData.name || 'Unknown User',
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

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  const formatDate = (date: Date | { toDate: () => Date } | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
    const hired = applications.filter(app => app.status === 'hired').length;
    
    return { total, pending, shortlisted, hired };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getApplicationStats();

  return (
    <div className="container-responsive py-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {userData.name}
          </h1>
          <p className="text-muted-foreground">
            Discover new opportunities and track your applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">Available positions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shortlisted}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hired}</div>
            <p className="text-xs text-muted-foreground">Job offers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Jobs Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by title, company, location, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="flex h-10 rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <Card>
            <CardHeader>
              <CardTitle>Available Jobs ({filteredJobs.length})</CardTitle>
              <CardDescription>
                Click on any job to view details and apply
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No jobs found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border-border hover:border-primary/50"
                      onClick={() => handleJobClick(job)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg text-primary">
                                {job.title}
                              </CardTitle>
                              {appliedJobs.has(job.id) && (
                                <Badge variant="success" className="text-xs">
                                  Applied
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{job.companyName}</p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                                  {formatDate(job.postedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {job.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 4} more
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
        </div>

        {/* Applications Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>
                Track your application status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-foreground mb-1">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start applying to jobs to track your progress here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((application) => (
                    <Card key={application.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm text-foreground">
                                {application.jobTitle}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {application.companyName}
                              </p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Applied {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {applications.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-muted-foreground">
                        +{applications.length - 5} more applications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">
                  {selectedJob.title}
                </DialogTitle>
                <DialogDescription>
                  View detailed job information and submit your application.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedJob.companyName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Salary
                    </h4>
                    <p className="text-success font-medium">{formatSalary(selectedJob.salary)}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Job Description</h4>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {appliedJobs.has(selectedJob.id) ? (
                    <div className="flex-1 flex items-center justify-center px-4 py-2 bg-success/10 text-success border border-success/20 rounded-md">
                      <CheckCircle className="h-4 w-4 mr-2" />
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
                    className="flex-1 sm:flex-none"
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