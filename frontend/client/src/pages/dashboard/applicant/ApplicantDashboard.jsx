import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Bookmark, Eye, TrendingUp,
  Clock, CheckCircle, XCircle, ArrowRight,
} from 'lucide-react';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { applicationsAPI, usersAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { timeAgo } from '@/lib/utils';

const statCards = [
  { label: 'Applications', key: 'totalApplications', icon: FileText, color: 'bg-blue-500' },
  { label: 'Under Review', key: 'underReview', icon: Clock, color: 'bg-yellow-500' },
  { label: 'Interviews', key: 'interviews', icon: Eye, color: 'bg-primary-500' },
  { label: 'Bookmarks', key: 'bookmarks', icon: Bookmark, color: 'bg-purple-500' },
];

export default function ApplicantDashboard() {
  const { user } = useAuthStore();

  const { data: appData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsAPI.getMyApplications({ limit: 5 }),
  });

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: usersAPI.getMyProfile,
  });

  const applications = appData?.data?.applications || [];
  const profile = profileData?.data?.profile;
  const completeness = profile?.profileCompleteness || 0;

  const stats = {
    totalApplications: appData?.data?.total || 0,
    underReview: applications.filter((a) => a.status === 'under_review' || a.status === 'pending').length,
    interviews: applications.filter((a) => a.status === 'interview_scheduled').length,
    bookmarks: profile?.bookmarkedJobs?.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-dark-500 mt-1">Here's what's happening with your job search</p>
      </motion.div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Complete your profile</h3>
              <p className="text-primary-100 text-sm mt-1">
                A complete profile increases your chances of getting hired by 3x
              </p>
            </div>
            <Link to="/dashboard/profile">
              <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-50 transition-colors">
                Update Profile
              </button>
            </Link>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Profile completion</span>
              <span className="font-semibold">{completeness}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-dark-900 dark:text-white">
                {appsLoading ? '—' : stats[stat.key]}
              </span>
            </div>
            <p className="text-sm text-dark-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Applications</h2>
          <Link to="/dashboard/applications" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-dark-100 dark:divide-dark-800">
          {appsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))
          ) : applications.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase size={40} className="mx-auto text-dark-300 mb-3" />
              <p className="text-dark-500">No applications yet</p>
              <Link to="/jobs">
                <button className="text-primary-500 text-sm mt-2 hover:underline">Browse Jobs →</button>
              </Link>
            </div>
          ) : (
            applications.map((app) => (
              <Link
                key={app._id}
                to={`/dashboard/applications`}
                className="flex items-center gap-4 p-4 sm:p-6 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-lg">
                  🏢
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-900 dark:text-white truncate">
                    {app.jobId?.title || 'Job Title'}
                  </p>
                  <p className="text-sm text-dark-500 truncate">
                    {app.jobId?.company || 'Company'} · Applied {timeAgo(app.createdAt)}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
