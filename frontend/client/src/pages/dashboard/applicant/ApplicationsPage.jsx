import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, XCircle, Eye, MessageSquare,
  Filter, ChevronDown, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { applicationsAPI } from '@/lib/api';
import { timeAgo, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', statusFilter],
    queryFn: () => applicationsAPI.getMyApplications({ status: statusFilter }),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id) => applicationsAPI.withdraw(id),
    onSuccess: () => {
      toast.success('Application withdrawn');
      queryClient.invalidateQueries(['my-applications']);
      setShowWithdrawModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to withdraw'),
  });

  const applications = data?.data?.applications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Applications</h1>
          <p className="text-dark-500 mt-1">Track your job applications</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-6 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={statusFilter ? 'No applications with this status' : 'You haven\'t applied to any jobs yet'}
          action={
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          }
        />
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {applications.map((app) => (
              <motion.div
                key={app._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl shrink-0">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white">
                          {app.jobId?.title || 'Job Position'}
                        </h3>
                        <p className="text-sm text-dark-500">
                          {app.jobId?.company || 'Company'} · {app.jobId?.location || 'Location'}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Applied {timeAgo(app.createdAt)}
                      </span>
                      {app.interviewDate && (
                        <span className="flex items-center gap-1 text-primary-500">
                          <Clock size={14} /> Interview: {formatDate(app.interviewDate)}
                        </span>
                      )}
                    </div>

                    {/* Status Timeline */}
                    {app.statusHistory?.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-dark-100 dark:border-dark-800">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {app.statusHistory.slice(-4).map((entry, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                i === app.statusHistory.slice(-4).length - 1 ? 'bg-primary-500' : 'bg-dark-300'
                              }`} />
                              <span className="text-dark-500 capitalize">{entry.status?.replace('_', ' ')}</span>
                              {i < app.statusHistory.slice(-4).length - 1 && (
                                <span className="text-dark-300">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Link to={`/jobs/${app.jobId?.slug || app.jobId?._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye size={14} /> View Job
                        </Button>
                      </Link>
                      {app.status !== 'withdrawn' && app.status !== 'rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowWithdrawModal(true);
                          }}
                        >
                          <XCircle size={14} /> Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Application"
        size="sm"
      >
        <p className="text-dark-500 mb-6">
          Are you sure you want to withdraw your application for{' '}
          <strong className="text-dark-900 dark:text-white">{selectedApp?.jobId?.title}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => withdrawMutation.mutate(selectedApp?._id)}
            isLoading={withdrawMutation.isPending}
          >
            Withdraw
          </Button>
        </div>
      </Modal>
    </div>
  );
}
