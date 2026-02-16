import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Globe, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { usersAPI } from '@/lib/api';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search],
    queryFn: () => usersAPI.getCompanies({ search }),
  });

  const companies = data?.data?.companies || [];

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <div className="bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Companies</h1>
          <p className="text-dark-500 mb-6">Discover great places to work</p>
          <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 rounded-lg px-4 max-w-lg">
            <Search size={18} className="text-dark-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 space-y-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies found"
            description="Try searching with different keywords"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-2xl">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {company.companyName}
                    </h3>
                    <p className="text-sm text-dark-500">{company.industry}</p>
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-dark-500 mt-3 line-clamp-2">{company.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-dark-400">
                  {company.headquarters && (
                    <span className="flex items-center gap-1"><MapPin size={12} /> {company.headquarters}</span>
                  )}
                  {company.employeeCount && (
                    <span className="flex items-center gap-1"><Users size={12} /> {company.employeeCount}</span>
                  )}
                  {company.website && (
                    <span className="flex items-center gap-1"><Globe size={12} /> Website</span>
                  )}
                </div>
                {company.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {company.techStack.slice(0, 4).map((t) => (
                      <Badge key={t} variant="secondary" size="sm">{t}</Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
