import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Filter, X, ChevronDown, Briefcase, Clock,
  DollarSign, Building2, Bookmark, BookmarkCheck, SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { jobsAPI } from '@/lib/api';
import { formatSalary, timeAgo } from '@/lib/utils';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const EXP_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-salary.min', label: 'Highest Salary' },
  { value: 'salary.min', label: 'Lowest Salary' },
];

function JobCard({ job }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card p-6 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl shrink-0">
          {job.companyLogo || '🏢'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/jobs/${job.slug || job._id}`}
                className="text-lg font-semibold text-dark-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              <p className="text-dark-500 text-sm mt-0.5">{job.company}</p>
            </div>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors shrink-0"
            >
              {bookmarked ? (
                <BookmarkCheck size={20} className="text-primary-500" />
              ) : (
                <Bookmark size={20} className="text-dark-400" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs text-dark-500">
              <MapPin size={14} /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-dark-500">
              <Briefcase size={14} /> {job.jobType}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-dark-500">
              <Clock size={14} /> {job.experienceLevel}
            </span>
            {job.salary?.min && (
              <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                <DollarSign size={14} /> {formatSalary(job.salary.min, job.salary.max)}
              </span>
            )}
          </div>

          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="secondary" size="sm">{skill}</Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="ghost" size="sm">+{job.skills.length - 5}</Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-100 dark:border-dark-800">
            <span className="text-xs text-dark-400">{timeAgo(job.createdAt)}</span>
            <Link to={`/jobs/${job.slug || job._id}`}>
              <Button variant="ghost" size="sm" className="text-primary-500">
                View Details →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [filters, setFilters] = useState({
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const queryParams = {
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page,
    limit: 12,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => jobsAPI.getAll(queryParams),
  });

  const jobs = data?.data?.jobs || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.pages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
    setPage(1);
  };

  const applyFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ jobType: '', experienceLevel: '', category: '', sort: '-createdAt' });
    setSearch('');
    setLocation('');
    setSearchParams({});
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== '-createdAt').length;

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Search Header */}
      <div className="bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-800 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center flex-1 gap-2 bg-dark-50 dark:bg-dark-800 rounded-lg px-4">
              <Search size={18} className="text-dark-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or company"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2.5 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none text-sm"
              />
            </div>
            <div className="flex items-center flex-1 gap-2 bg-dark-50 dark:bg-dark-800 rounded-lg px-4">
              <MapPin size={18} className="text-dark-400 shrink-0" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2.5 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Search size={16} /> Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-dark-200 dark:border-dark-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-dark-500 mb-1.5 block">Job Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => applyFilter('jobType', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="">All Types</option>
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-dark-500 mb-1.5 block">Experience</label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => applyFilter('experienceLevel', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="">All Levels</option>
                      {EXP_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-dark-500 mb-1.5 block">Sort By</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => applyFilter('sort', e.target.value)}
                      className="input-field text-sm"
                    >
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X size={14} /> Clear All
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-dark-500">
            {isLoading ? 'Searching...' : `${total} jobs found`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description="Try adjusting your search or filters to find what you're looking for"
            action={<Button onClick={clearFilters}>Clear Filters</Button>}
          />
        ) : (
          <>
            <motion.div layout className="space-y-4">
              <AnimatePresence>
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page + i - 2;
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
