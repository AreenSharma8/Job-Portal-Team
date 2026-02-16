import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin, Briefcase, Clock, DollarSign, Building2, Calendar,
  Users, Share2, Bookmark, BookmarkCheck, ArrowLeft, CheckCircle,
  Globe, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { formatSalary, timeAgo, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.getBySlug(id).catch(() => jobsAPI.getById(id)),
  });

  const job = data?.data?.job || data?.data;

  const applyMutation = useMutation({
    mutationFn: () => applicationsAPI.apply(job._id),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries(['job', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to apply');
    },
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
          <div className="card p-8 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Job Not Found</h2>
          <p className="text-dark-500 mb-4">This job may have been removed or is no longer available.</p>
          <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-dark-500 hover:text-primary-500 transition-colors">
            <ArrowLeft size={16} /> Back to jobs
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Header */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-2xl shrink-0">
                  {job.companyLogo || '🏢'}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{job.title}</h1>
                  <p className="text-dark-500 mt-1">{job.company}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-dark-500">
                      <MapPin size={16} /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-dark-500">
                      <Briefcase size={16} /> {job.jobType}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-dark-500">
                      <Clock size={16} /> {job.experienceLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-dark-100 dark:border-dark-800">
                {job.salary?.min && (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg px-3 py-2 text-sm font-medium">
                    <DollarSign size={16} />
                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    {job.salary.period && <span className="text-green-500">/{job.salary.period}</span>}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 rounded-lg px-3 py-2 text-sm text-dark-600 dark:text-dark-300">
                  <Calendar size={16} />
                  Posted {timeAgo(job.createdAt)}
                </div>
                <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 rounded-lg px-3 py-2 text-sm text-dark-600 dark:text-dark-300">
                  <Users size={16} />
                  {job.applicationsCount || 0} applicants
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose prose-dark dark:prose-invert max-w-none text-dark-600 dark:text-dark-300 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-dark-600 dark:text-dark-300">
                      <CheckCircle size={18} className="text-secondary-500 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2 text-dark-600 dark:text-dark-300">
                      <CheckCircle size={18} className="text-primary-500 mt-0.5 shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" size="md">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Apply Card */}
            <div className="card p-6 sticky top-28">
              {user?.role === 'applicant' || !isAuthenticated ? (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleApply}
                    isLoading={applyMutation.isPending}
                  >
                    Apply Now
                  </Button>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Bookmark size={16} /> Save
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Share2 size={16} /> Share
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-dark-500 text-center">
                  Only job seekers can apply to this position.
                </p>
              )}

              {/* Job Summary */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-dark-900 dark:text-white text-sm">Job Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-500">Location</span>
                    <span className="text-dark-800 dark:text-dark-200 font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-500">Job Type</span>
                    <span className="text-dark-800 dark:text-dark-200 font-medium">{job.jobType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-500">Experience</span>
                    <span className="text-dark-800 dark:text-dark-200 font-medium">{job.experienceLevel}</span>
                  </div>
                  {job.salary?.min && (
                    <div className="flex items-center justify-between">
                      <span className="text-dark-500">Salary</span>
                      <span className="text-dark-800 dark:text-dark-200 font-medium">
                        {formatSalary(job.salary.min, job.salary.max)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-dark-500">Posted</span>
                    <span className="text-dark-800 dark:text-dark-200 font-medium">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                  {job.deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-dark-500">Deadline</span>
                      <span className="text-red-500 font-medium">{formatDate(job.deadline)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {job.tags?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-dark-900 dark:text-white text-sm mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/jobs?search=${encodeURIComponent(tag)}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
