import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Briefcase, MapPin, DollarSign, Clock, FileText, Plus, X,
  Tag, Users, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { jobsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const EXP_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];

const jobSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  company: z.string().min(2, 'Company is required'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.string().min(1, 'Select job type'),
  experienceLevel: z.string().min(1, 'Select experience level'),
  description: z.string().min(50, 'Minimum 50 characters').max(10000),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.string().optional(),
});

export default function PostJobPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [requirements, setRequirements] = useState(['']);
  const [responsibilities, setResponsibilities] = useState(['']);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: { salaryCurrency: 'INR' },
  });

  const createMutation = useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: () => {
      toast.success('Job posted successfully!');
      navigate('/dashboard/jobs');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post'),
  });

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) {
      setSkills([...skills, t]);
      setSkillInput('');
    }
  };

  const updateListItem = (list, setList, index, value) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (list, setList) => setList([...list, '']);

  const removeListItem = (list, setList, index) => {
    if (list.length > 1) setList(list.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      company: data.company,
      location: data.location,
      jobType: data.jobType,
      experienceLevel: data.experienceLevel,
      description: data.description,
      skills,
      requirements: requirements.filter((r) => r.trim()),
      responsibilities: responsibilities.filter((r) => r.trim()),
    };
    if (data.salaryMin) {
      payload.salary = {
        min: Number(data.salaryMin),
        max: data.salaryMax ? Number(data.salaryMax) : undefined,
        currency: data.salaryCurrency || 'INR',
        period: 'yearly',
      };
    }
    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Post a New Job</h1>
        <p className="text-dark-500 mt-1">Fill in the details to create a new job listing</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Basic Information</h2>
          <Input
            label="Job Title *"
            placeholder="e.g. Senior React Developer"
            icon={Briefcase}
            {...register('title')}
            error={errors.title?.message}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Company *"
              placeholder="Company name"
              {...register('company')}
              error={errors.company?.message}
            />
            <Input
              label="Location *"
              placeholder="e.g. Mumbai, India or Remote"
              icon={MapPin}
              {...register('location')}
              error={errors.location?.message}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Job Type *
              </label>
              <select className="input-field" {...register('jobType')}>
                <option value="">Select type</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.jobType && <p className="text-sm text-red-500 mt-1">{errors.jobType.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Experience Level *
              </label>
              <select className="input-field" {...register('experienceLevel')}>
                <option value="">Select level</option>
                {EXP_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.experienceLevel && <p className="text-sm text-red-500 mt-1">{errors.experienceLevel.message}</p>}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Description</h2>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Job Description *
            </label>
            <textarea
              rows={8}
              placeholder="Describe the role, what the candidate will be doing, and what makes this opportunity exciting..."
              className="input-field resize-none"
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
          </div>
        </motion.div>

        {/* Requirements & Responsibilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">Requirements</h2>
            <div className="space-y-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateListItem(requirements, setRequirements, i, e.target.value)}
                    placeholder={`Requirement ${i + 1}`}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(requirements, setRequirements, i)}
                    className="p-2 text-dark-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addListItem(requirements, setRequirements)}>
                <Plus size={14} /> Add Requirement
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">Responsibilities</h2>
            <div className="space-y-2">
              {responsibilities.map((resp, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => updateListItem(responsibilities, setResponsibilities, i, e.target.value)}
                    placeholder={`Responsibility ${i + 1}`}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(responsibilities, setResponsibilities, i)}
                    className="p-2 text-dark-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addListItem(responsibilities, setResponsibilities)}>
                <Plus size={14} /> Add Responsibility
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Skills</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Type a skill and press Enter"
              className="input-field flex-1"
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              <Plus size={16} /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="pr-1">
                {skill}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((s) => s !== skill))}
                  className="ml-1 p-0.5 rounded hover:bg-dark-200 dark:hover:bg-dark-600"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Salary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Salary (Optional)</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Minimum"
              type="number"
              placeholder="e.g. 500000"
              icon={DollarSign}
              {...register('salaryMin')}
            />
            <Input
              label="Maximum"
              type="number"
              placeholder="e.g. 1000000"
              icon={DollarSign}
              {...register('salaryMax')}
            />
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Currency
              </label>
              <select className="input-field" {...register('salaryCurrency')}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending} size="lg">
            <CheckCircle size={18} /> Post Job
          </Button>
        </div>
      </form>
    </div>
  );
}
