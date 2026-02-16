import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, Globe, Users, Mail, Phone,
  Save, Image, Plus, X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  description: z.string().max(5000).optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  headquarters: z.string().optional(),
  employeeCount: z.string().optional(),
  foundedYear: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
});

export default function CompanyProfilePage() {
  const queryClient = useQueryClient();
  const [benefits, setBenefits] = useState([]);
  const [benefitInput, setBenefitInput] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-company'],
    queryFn: usersAPI.getMyCompany,
    onSuccess: (res) => {
      const c = res.data?.company;
      if (c) {
        reset({
          companyName: c.companyName || '',
          industry: c.industry || '',
          description: c.description || '',
          website: c.website || '',
          headquarters: c.headquarters || '',
          employeeCount: c.employeeCount || '',
          foundedYear: c.foundedYear?.toString() || '',
          email: c.email || '',
          phone: c.phone || '',
        });
        setBenefits(c.benefits || []);
        setTechStack(c.techStack || []);
      }
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(companySchema),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => usersAPI.updateCompany({ ...data, benefits, techStack }),
    onSuccess: () => {
      toast.success('Company profile updated!');
      queryClient.invalidateQueries(['my-company']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const addItem = (input, setInput, list, setList) => {
    const t = input.trim();
    if (t && !list.includes(t)) {
      setList([...list, t]);
      setInput('');
    }
  };

  const onSubmit = (data) => saveMutation.mutate(data);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Company Profile</h1>
        <p className="text-dark-500 mt-1">Showcase your company to attract the best talent</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              placeholder="Your company name"
              icon={Building2}
              {...register('companyName')}
              error={errors.companyName?.message}
            />
            <Input
              label="Industry *"
              placeholder="e.g. Technology, Finance"
              {...register('industry')}
              error={errors.industry?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Company Description
            </label>
            <textarea
              rows={5}
              placeholder="Tell candidates about your company culture, mission, and values..."
              className="input-field resize-none"
              {...register('description')}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Website"
              placeholder="https://yourcompany.com"
              icon={Globe}
              {...register('website')}
              error={errors.website?.message}
            />
            <Input
              label="Headquarters"
              placeholder="e.g. Mumbai, India"
              icon={MapPin}
              {...register('headquarters')}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Employee Count"
              placeholder="e.g. 100-500"
              icon={Users}
              {...register('employeeCount')}
            />
            <Input
              label="Founded Year"
              placeholder="e.g. 2015"
              {...register('foundedYear')}
            />
            <Input
              label="Contact Email"
              placeholder="hr@company.com"
              icon={Mail}
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Benefits & Perks</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(benefitInput, setBenefitInput, benefits, setBenefits))}
              placeholder="e.g. Health Insurance, WFH, Gym"
              className="input-field flex-1"
            />
            <Button type="button" variant="outline" onClick={() => addItem(benefitInput, setBenefitInput, benefits, setBenefits)}>
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {benefits.map((b) => (
              <Badge key={b} variant="secondary" className="pr-1">
                {b}
                <button type="button" onClick={() => setBenefits(benefits.filter((x) => x !== b))} className="ml-1 p-0.5 rounded hover:bg-dark-200">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Tech Stack</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(techInput, setTechInput, techStack, setTechStack))}
              placeholder="e.g. React, Node.js, MongoDB"
              className="input-field flex-1"
            />
            <Button type="button" variant="outline" onClick={() => addItem(techInput, setTechInput, techStack, setTechStack)}>
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t) => (
              <Badge key={t} variant="primary" className="pr-1">
                {t}
                <button type="button" onClick={() => setTechStack(techStack.filter((x) => x !== t))} className="ml-1 p-0.5 rounded hover:bg-primary-600">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saveMutation.isPending} size="lg">
            <Save size={18} /> Save Company Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
