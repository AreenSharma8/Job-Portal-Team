import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Users, Eye, TrendingUp,
  Plus, ArrowRight, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { timeAgo } from '@/lib/utils';

export default function EmployerDashboard() {
  const { user } = useAuthStore();

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => jobsAPI.getEmployerJobs({ limit: 5 }),
  });

  const jobs = jobsData?.data?.jobs || [];
  const totalJobs = jobsData?.data?.total || 0;

  const statCards = [
    { label: 'Active Jobs', value: totalJobs, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Total Views', value: jobs.reduce((a, j) => a + (j.views || 0), 0), icon: Eye, color: 'bg-primary-500' },
    { label: 'Applications', value: jobs.reduce((a, j) => a + (j.applicationsCount || 0), 0), icon: FileText, color: 'bg-green-500' },
    { label: 'Hired', value: 0, icon: CheckCircle, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            Employer Dashboard
          </h1>
          <p className="text-dark-500 mt-1">Manage your job listings and applications</p>
        </div>
        <Link to="/dashboard/post-job">
          <Button>
            <Plus size={18} /> Post New Job
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-dark-900 dark:text-white">
                {jobsLoading ? '—' : stat.value}
              </span>
            </div>
            <p className="text-sm text-dark-500 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Recent Job Listings</h2>
          <Link to="/dashboard/jobs" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-dark-100 dark:divide-dark-800">
          {jobsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase size={40} className="mx-auto text-dark-300 mb-3" />
              <p className="text-dark-500 mb-3">No jobs posted yet</p>
              <Link to="/dashboard/post-job">
                <Button size="sm">
                  <Plus size={14} /> Post Your First Job
                </Button>
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <Link
                key={job._id}
                to={`/dashboard/jobs`}
                className="flex items-center gap-4 p-4 sm:p-6 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-900 dark:text-white truncate">{job.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-dark-500">
                    <span>{job.location}</span>
                    <span>·</span>
                    <span>{job.applicationsCount || 0} applicants</span>
                    <span>·</span>
                    <span>{timeAgo(job.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={job.status || 'active'} />
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
