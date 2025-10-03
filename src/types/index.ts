export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'job_finder' | 'company';
  createdAt: Date;
}

export interface JobFinder extends User {
  userType: 'job_finder';
  resume?: string;
  skills: string[];
  experience: string;
  location: string;
  phone?: string;
}

export interface Company extends User {
  userType: 'company';
  companyName: string;
  description: string;
  website?: string;
  location: string;
  industry: string;
  size: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  experience: string;
  postedAt: Date;
  deadline?: Date;
  isActive: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  coverLetter?: string;
  resume?: string;
  appliedAt: Date;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
}