import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Briefcase, Search, Eye, CheckCircle, XCircle, AlertTriangle,
  Clock, Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { adminAPI } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminJobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [moderateJob, setModerateJob] = useState(null);
  const [moderateAction, setModerateAction] = useState('');
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', search, statusFilter, page],
    queryFn: () => adminAPI.getJobs({ search, status: statusFilter, page }),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action, reason }) => adminAPI.moderateJob(id, { action, reason }),
    onSuccess: () => {
      toast.success('Job moderated successfully');
      queryClient.invalidateQueries(['admin-jobs']);
      setModerateJob(null);
      setReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to moderate'),
  });

  const jobs = data?.data?.jobs || [];
  const total = data?.data?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Job Moderation</h1>
        <p className="text-dark-500 mt-1">{total} total jobs</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center flex-1 gap-2 bg-white dark:bg-dark-800 rounded-lg px-4 border border-dark-200 dark:border-dark-700">
          <Search size={18} className="text-dark-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full py-2.5 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-6">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-dark-900 dark:text-white truncate">{job.title}</h3>
                    <StatusBadge status={job.status || 'active'} />
                  </div>
                  <p className="text-sm text-dark-500 mt-1">
                    {job.company} · {job.location} · {job.jobType}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-dark-400">
                    <span className="flex items-center gap-1"><Eye size={12} /> {job.views || 0} views</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(job.createdAt)}</span>
                    <span>By: {job.employer?.name || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-500"
                    onClick={() => {
                      setModerateJob(job);
                      setModerateAction('approve');
                    }}
                  >
                    <CheckCircle size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-yellow-500"
                    onClick={() => {
                      setModerateJob(job);
                      setModerateAction('flag');
                    }}
                  >
                    <Flag size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      setModerateJob(job);
                      setModerateAction('reject');
                    }}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>

      {/* Moderate Modal */}
      <Modal
        isOpen={!!moderateJob}
        onClose={() => setModerateJob(null)}
        title={`${moderateAction === 'approve' ? 'Approve' : moderateAction === 'flag' ? 'Flag' : 'Reject'} Job`}
        size="sm"
      >
        {moderateJob && (
          <div className="space-y-4">
            <p className="text-dark-500">
              {moderateAction === 'approve' && 'Approve this job listing?'}
              {moderateAction === 'flag' && 'Flag this job for review?'}
              {moderateAction === 'reject' && 'Reject and remove this job listing?'}
            </p>
            <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg">
              <p className="font-medium text-dark-900 dark:text-white">{moderateJob.title}</p>
              <p className="text-sm text-dark-500">{moderateJob.company}</p>
            </div>
            {moderateAction !== 'approve' && (
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a reason..."
                  className="input-field resize-none"
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setModerateJob(null)}>Cancel</Button>
              <Button
                variant={moderateAction === 'reject' ? 'danger' : 'primary'}
                onClick={() => moderateMutation.mutate({
                  id: moderateJob._id,
                  action: moderateAction,
                  reason,
                })}
                isLoading={moderateMutation.isPending}
              >
                {moderateAction === 'approve' ? 'Approve' : moderateAction === 'flag' ? 'Flag' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
