# Vasai IT Job Portal 🚀

A modern, full-stack job portal application built with Next.js, Firebase, and Tailwind CSS. This platform connects IT professionals with companies in the Vasai region, featuring a sleek dark mode interface and real-time job matching.

![Job Portal Demo](https://img.shields.io/badge/Status-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8)

## ✨ Features

### For Job Seekers
- 🔍 **Smart Job Search** - Search by title, company, location, or skills
- 📱 **Responsive Dashboard** - Track applications and job status
- 🎯 **One-Click Apply** - Simple application process
- 📊 **Application Tracking** - Real-time status updates
- 🌙 **Dark Mode UI** - Eye-friendly interface

### For Companies
- 📝 **Easy Job Posting** - Intuitive job creation form
- 👥 **Applicant Management** - Review and manage applications
- 📈 **Analytics Dashboard** - Track job performance
- ⚡ **Real-time Updates** - Instant application notifications
- 🎨 **Professional Interface** - Clean, modern design

### Technical Features
- 🔐 **Firebase Authentication** - Secure user management
- 🗄️ **Firestore Database** - Real-time data synchronization
- 🌐 **Server-side Rendering** - Optimized performance
- 🔒 **Security Rules** - Protected data access
- 📱 **Mobile Responsive** - Works on all devices
- ⚡ **Vercel Deployment** - Fast, global CDN

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI Components
- **Backend**: Firebase (Auth, Firestore, Admin SDK)
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ScarRanger/vasai-it-job-portal.git
   cd vasai-it-job-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Get your Firebase config and add to `.env.local`:
   
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   
   # Firebase Admin (for production)
   FIREBASE_SERVICE_ACCOUNT_KEY=your-base64-encoded-service-account
   ```

5. **Deploy Firestore Security Rules**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── CompanyDashboard.tsx
│   ├── JobFinderDashboard.tsx
│   └── LandingPage.tsx
├── contexts/             # React contexts
│   └── AuthContext.tsx
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Client-side Firebase
│   ├── firebase-admin.ts # Server-side Firebase
│   └── utils.ts
├── services/             # Business logic
│   └── firebase.ts       # Database operations
└── types/                # TypeScript types
    └── index.ts
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication Methods**
   - Email/Password authentication
   - Configure sign-in methods in Firebase Console

2. **Firestore Database**
   - Create collections: `users`, `jobs`, `applications`
   - Deploy security rules from `firestore.rules`

3. **Service Account (Production)**
   - Download service account JSON from Firebase Console
   - Encode to base64: `.\encode-service-account.ps1 -JsonFilePath "service-account.json"`
   - Add to environment variables

### Deployment

#### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   vercel
   ```

2. **Set Environment Variables**
   - Add all Firebase config variables
   - Include `FIREBASE_SERVICE_ACCOUNT_KEY` for production

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🗄️ Database Schema

### Users Collection
```typescript
{
  id: string;
  email: string;
  name: string;
  userType: 'job_finder' | 'company';
  // Additional fields based on user type
}
```

### Jobs Collection
```typescript
{
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: { min: number; max: number; currency: string };
  skills: string[];
  postedAt: Date;
  isActive: boolean;
}
```

### Applications Collection
```typescript
{
  id: string;
  jobId: string;
  applicantId: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: Date;
  coverLetter?: string;
}
```

## 🔒 Security

- **Firebase Security Rules** - Row-level security for all data
- **Authentication Required** - All operations require valid user
- **Role-based Access** - Companies can only manage their jobs
- **Server-side Validation** - Admin SDK for secure operations
- **Environment Variables** - Sensitive data protected

## 🎨 UI/UX Features

- **Dark Mode Only** - Consistent dark theme throughout
- **Responsive Design** - Mobile-first approach
- **Interactive Components** - Smooth animations and transitions
- **Accessibility** - ARIA labels and keyboard navigation
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages

## 📱 Screenshots

| Landing Page | Job Seeker Dashboard | Company Dashboard |
|-------------|---------------------|-------------------|
| ![Landing](https://via.placeholder.com/300x200?text=Landing+Page) | ![Job+Seeker](https://via.placeholder.com/300x200?text=Job+Seeker) | ![Company](https://via.placeholder.com/300x200?text=Company) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions
- Test components before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Lucide](https://lucide.dev/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/ScarRanger/vasai-it-job-portal/issues) page
2. Create a new issue with detailed description
3. Contact the maintainer: [GitHub Profile](https://github.com/ScarRanger)

## 🚧 Roadmap

- [ ] Advanced search filters
- [ ] Email notifications
- [ ] Resume upload functionality
- [ ] Company profiles
- [ ] Job alerts and subscriptions
- [ ] Interview scheduling
- [ ] Video call integration
- [ ] Mobile app (React Native)

---

**Built with ❤️ for the Vasai IT community**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FScarRanger%2Fvasai-it-job-portal)