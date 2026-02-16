import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bookmark, MapPin, Briefcase, Clock, DollarSign, Trash2, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { usersAPI } from '@/lib/api';
import { formatSalary, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: usersAPI.getBookmarks,
  });

  const removeMutation = useMutation({
    mutationFn: (jobId) => usersAPI.toggleBookmark(jobId),
    onSuccess: () => {
      toast.success('Bookmark removed');
      queryClient.invalidateQueries(['bookmarks']);
    },
  });

  const bookmarks = data?.data?.bookmarks || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Saved Jobs</h1>
        <p className="text-dark-500 mt-1">
          {bookmarks.length} saved job{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs"
          description="Save jobs you're interested in and apply when you're ready"
          action={
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          }
        />
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence>
            {bookmarks.map((job) => (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl shrink-0">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/jobs/${job.slug || job._id}`}
                      className="text-lg font-semibold text-dark-900 dark:text-white hover:text-primary-500 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-dark-500 text-sm">{job.company}</p>

                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} /> {job.jobType}
                      </span>
                      {job.salary?.min && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} /> {formatSalary(job.salary.min, job.salary.max)}
                        </span>
                      )}
                    </div>

                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link to={`/jobs/${job.slug || job._id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink size={14} /> View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => removeMutation.mutate(job._id)}
                    >
                      <Trash2 size={14} /> Remove
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
