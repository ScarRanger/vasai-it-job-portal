export interface User {
  id: string;
  email: string;
  phone: string;
  name?: string; // Optional, could be either user name or contact person name
  password?: string; // Only for registration, not stored
  addressProof?: string; // URL to uploaded document
  userType: 'job_finder' | 'company';
  createdAt: Date;
  profileCompleted: boolean; // New field to track profile completion
}

export interface JobFinder extends User {
  userType: 'job_finder';
  name?: string; // Optional until profile completion
  resume?: string;
  skills?: string[];
  experience?: string;
  location?: string;
}

export interface Company extends User {
  userType: 'company';
  companyName?: string; // Optional until profile completion
  contactPersonName?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
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