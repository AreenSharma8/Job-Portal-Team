import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, FileText, TrendingUp, UserCheck, UserX,
  Building2, Activity,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminAPI } from '@/lib/api';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAPI.getDashboardStats,
  });

  const stats = data?.data;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Active Jobs', value: stats?.totalJobs, icon: Briefcase, color: 'bg-primary-500', change: '+8%' },
    { label: 'Applications', value: stats?.totalApplications, icon: FileText, color: 'bg-green-500', change: '+24%' },
    { label: 'Companies', value: stats?.totalCompanies, icon: Building2, color: 'bg-purple-500', change: '+5%' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-dark-500 mt-1">Platform overview and management</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
              <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                {card.change}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-dark-900 dark:text-white">
                {isLoading ? <Skeleton className="h-7 w-16" /> : (card.value || 0).toLocaleString()}
              </div>
              <p className="text-sm text-dark-500">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users by Role / Applications by Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Users by Role</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.usersByRole || []).map((item) => {
                const colors = { applicant: 'bg-blue-500', employer: 'bg-primary-500', admin: 'bg-purple-500' };
                const total = stats?.totalUsers || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-600 dark:text-dark-300 capitalize">{item._id}</span>
                      <span className="text-dark-500">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[item._id] || 'bg-dark-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Applications by Status</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(stats?.applicationsByStatus || []).map((item) => {
                const colors = {
                  pending: 'bg-yellow-500', under_review: 'bg-blue-500',
                  shortlisted: 'bg-green-500', rejected: 'bg-red-500',
                  interview_scheduled: 'bg-primary-500', offered: 'bg-purple-500',
                };
                const total = stats?.totalApplications || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-600 dark:text-dark-300 capitalize">
                        {item._id?.replace('_', ' ')}
                      </span>
                      <span className="text-dark-500">{item.count}</span>
                    </div>
                    <div className="h-2 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[item._id] || 'bg-dark-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
          <Activity size={20} className="inline mr-2" />
          Platform Activity
        </h2>
        <div className="text-center py-8 text-dark-400">
          <Activity size={40} className="mx-auto mb-3 opacity-50" />
          <p>Activity feed coming soon</p>
        </div>
      </motion.div>
    </div>
  );
}
