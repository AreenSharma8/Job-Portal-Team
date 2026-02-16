import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Search, MapPin, Briefcase, TrendingUp, Users, Building2,
  ArrowRight, Star, CheckCircle, Zap, Globe, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const categories = [
  { name: 'Technology', icon: '💻', count: '12,500+', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Marketing', icon: '📢', count: '8,200+', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Design', icon: '🎨', count: '5,400+', color: 'bg-pink-50 dark:bg-pink-900/20' },
  { name: 'Finance', icon: '💰', count: '6,800+', color: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'Healthcare', icon: '🏥', count: '4,300+', color: 'bg-red-50 dark:bg-red-900/20' },
  { name: 'Education', icon: '📚', count: '3,100+', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { name: 'Engineering', icon: '⚙️', count: '9,700+', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { name: 'Sales', icon: '📈', count: '7,500+', color: 'bg-orange-50 dark:bg-orange-900/20' },
];

const featuredCompanies = [
  { name: 'Google', logo: '🔍', jobs: 245 },
  { name: 'Microsoft', logo: '🪟', jobs: 189 },
  { name: 'Amazon', logo: '📦', jobs: 312 },
  { name: 'Meta', logo: '🌐', jobs: 156 },
  { name: 'Apple', logo: '🍎', jobs: 203 },
  { name: 'Netflix', logo: '🎬', jobs: 87 },
];

const stats = [
  { label: 'Active Jobs', value: '50,000+', icon: Briefcase },
  { label: 'Companies', value: '12,000+', icon: Building2 },
  { label: 'Job Seekers', value: '2M+', icon: Users },
  { label: 'Placements', value: '500K+', icon: TrendingUp },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
            >
              <Zap size={16} className="text-primary-400" />
              <span className="text-sm font-medium text-primary-300">
                #1 Job Platform in India
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              Find Your{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                Dream Job
              </span>
              <br />
              Start Your Career
            </h1>

            <p className="text-lg sm:text-xl text-dark-300 mb-10 max-w-2xl mx-auto">
              Discover thousands of opportunities from top companies. Your next career move starts here.
            </p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSearch}
              className="bg-white dark:bg-dark-800 rounded-2xl p-2 shadow-2xl shadow-black/20 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2"
            >
              <div className="flex items-center flex-1 gap-2 px-4">
                <Search size={20} className="text-dark-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none"
                />
              </div>
              <div className="hidden sm:block w-px bg-dark-200 dark:bg-dark-700" />
              <div className="flex items-center flex-1 gap-2 px-4">
                <MapPin size={20} className="text-dark-400 shrink-0" />
                <input
                  type="text"
                  placeholder="City or remote"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full py-3 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="sm:px-8">
                <Search size={18} />
                Search
              </Button>
            </motion.form>

            {/* Popular searches */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-6"
            >
              <span className="text-sm text-dark-400">Popular:</span>
              {['React Developer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps'].map((term) => (
                <Link
                  key={term}
                  to={`/jobs?search=${encodeURIComponent(term)}`}
                  className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-dark-200 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon size={24} className="text-primary-500" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-dark-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-3">
              Browse by Category
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              Explore opportunities across various industries and find the perfect role
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={fadeInUp}>
                <Link
                  to={`/jobs?category=${encodeURIComponent(cat.name)}`}
                  className={`block p-6 rounded-xl ${cat.color} hover:shadow-lg transition-all duration-300 group`}
                >
                  <span className="text-3xl mb-3 block">{cat.icon}</span>
                  <h3 className="font-semibold text-dark-900 dark:text-white group-hover:text-primary-500 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-dark-500 mt-1">{cat.count} jobs</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-3">
              Top Companies Hiring
            </h2>
            <p className="text-dark-500">
              Join thousands of professionals working at industry-leading companies
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {featuredCompanies.map((company) => (
              <motion.div key={company.name} variants={fadeInUp}>
                <div className="card p-6 text-center group cursor-pointer">
                  <span className="text-4xl block mb-3">{company.logo}</span>
                  <h3 className="font-semibold text-dark-800 dark:text-dark-200">{company.name}</h3>
                  <p className="text-xs text-dark-500 mt-1">{company.jobs} jobs</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-dark-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-3">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Create Your Profile', desc: 'Sign up and build your professional profile to showcase your skills.', icon: Users },
              { step: 2, title: 'Search & Apply', desc: 'Browse thousands of jobs and apply with a single click.', icon: Search },
              { step: 3, title: 'Get Hired', desc: 'Connect with employers and land your dream job.', icon: CheckCircle },
            ].map((item) => (
              <motion.div key={item.step} {...fadeInUp} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <item.icon size={28} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary-500 text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-dark-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join millions of professionals who have found their dream jobs through JobPortal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="dark"
                size="xl"
                onClick={() => navigate('/register')}
                className="bg-white text-primary-600 hover:bg-dark-50"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate('/jobs')}
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Browse Jobs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
