import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Eye, Users, Clock, MoreVertical, Edit, Trash2,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { jobsAPI } from '@/lib/api';
import { timeAgo, formatSalary } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EmployerJobsPage() {
  const queryClient = useQueryClient();
  const [deleteJob, setDeleteJob] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => jobsAPI.getEmployerJobs(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobsAPI.delete(id),
    onSuccess: () => {
      toast.success('Job deleted');
      queryClient.invalidateQueries(['employer-jobs']);
      setDeleteJob(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const jobs = data?.data?.jobs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Job Listings</h1>
          <p className="text-dark-500 mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <Link to="/dashboard/post-job">
          <Button>Post New Job</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job listing to start finding great candidates"
          action={
            <Link to="/dashboard/post-job">
              <Button>Post Your First Job</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
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
                  <p className="text-sm text-dark-500 mt-1">{job.location} · {job.jobType}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {job.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {job.applicationsCount || 0} applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {timeAgo(job.createdAt)}
                    </span>
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary" size="sm">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link to={`/dashboard/applications?jobId=${job._id}`}>
                    <Button variant="outline" size="sm">
                      <Users size={14} /> Applicants
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => setDeleteJob(job)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteJob}
        onClose={() => setDeleteJob(null)}
        title="Delete Job"
        size="sm"
      >
        <p className="text-dark-500 mb-6">
          Are you sure you want to delete <strong className="text-dark-900 dark:text-white">{deleteJob?.title}</strong>?
          This will also remove all associated applications.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteJob(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => deleteMutation.mutate(deleteJob._id)}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
