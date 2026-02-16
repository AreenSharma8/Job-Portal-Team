import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Users, FileText, Clock, CheckCircle, XCircle, MessageSquare,
  Star, Calendar, Eye, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { applicationsAPI } from '@/lib/api';
import { timeAgo, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'under_review', label: 'Under Review', color: 'text-blue-500' },
  { value: 'shortlisted', label: 'Shortlist', color: 'text-green-500' },
  { value: 'interview_scheduled', label: 'Schedule Interview', color: 'text-primary-500' },
  { value: 'offered', label: 'Make Offer', color: 'text-purple-500' },
  { value: 'rejected', label: 'Reject', color: 'text-red-500' },
];

export default function EmployerApplicationsPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employer-applications', jobId],
    queryFn: () => applicationsAPI.getJobApplications(jobId),
    enabled: !!jobId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, notes }) =>
      applicationsAPI.updateStatus(id, { status, notes }),
    onSuccess: () => {
      toast.success('Application status updated');
      queryClient.invalidateQueries(['employer-applications']);
      setStatusModal(null);
      setNotes('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const applications = data?.data?.applications || [];
  const stats = data?.data?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Applications</h1>
        <p className="text-dark-500 mt-1">Review and manage candidate applications</p>
      </div>

      {!jobId ? (
        <EmptyState
          icon={FileText}
          title="Select a job"
          description="Go to My Jobs and click 'Applicants' to view applications for a specific job"
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applications yet"
          description="Applications will appear here once candidates start applying"
        />
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: applications.length, color: 'bg-dark-500' },
              { label: 'Pending', value: stats.pending || 0, color: 'bg-yellow-500' },
              { label: 'Shortlisted', value: stats.shortlisted || 0, color: 'bg-green-500' },
              { label: 'Interview', value: stats.interview_scheduled || 0, color: 'bg-primary-500' },
              { label: 'Rejected', value: stats.rejected || 0, color: 'bg-red-500' },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
                <div className="text-xl font-bold text-dark-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-dark-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-3">
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {app.applicantId?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white">
                          {app.applicantId?.name || 'Applicant'}
                        </h3>
                        <p className="text-sm text-dark-500">
                          {app.applicantId?.email} · Applied {timeAgo(app.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    {app.notes && (
                      <p className="text-sm text-dark-400 mt-2 italic">"{app.notes}"</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {STATUS_OPTIONS.filter((s) => s.value !== app.status).map((opt) => (
                        <Button
                          key={opt.value}
                          variant="ghost"
                          size="sm"
                          className={opt.color}
                          onClick={() => {
                            setStatusModal(app);
                            setNewStatus(opt.value);
                          }}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Application Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-dark-500">
            Change status of <strong className="text-dark-900 dark:text-white">{statusModal?.applicantId?.name}</strong>'s
            application to <StatusBadge status={newStatus} />
          </p>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this decision..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setStatusModal(null)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate({ id: statusModal._id, status: newStatus, notes })}
              isLoading={updateMutation.isPending}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
