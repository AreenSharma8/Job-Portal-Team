import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award,
  Linkedin, Github, Globe, Plus, Trash2, Save, Upload, X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { usersAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  headline: z.string().max(120, 'Max 120 characters').optional(),
  summary: z.string().max(2000, 'Max 2000 characters').optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url('Invalid URL').or(z.literal('')).optional(),
    github: z.string().url('Invalid URL').or(z.literal('')).optional(),
    portfolio: z.string().url('Invalid URL').or(z.literal('')).optional(),
  }).optional(),
});

export default function ProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: usersAPI.getMyProfile,
    onSuccess: (res) => {
      const p = res.data?.profile;
      if (p) {
        reset({
          headline: p.headline || '',
          summary: p.summary || '',
          phone: p.phone || '',
          location: p.location || '',
          socialLinks: {
            linkedin: p.socialLinks?.linkedin || '',
            github: p.socialLinks?.github || '',
            portfolio: p.socialLinks?.portfolio || '',
          },
        });
        setSkills(p.skills || []);
      }
    },
  });

  const profile = data?.data?.profile;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => usersAPI.updateProfile({ ...data, skills }),
    onSuccess: () => {
      toast.success('Profile updated!');
      queryClient.invalidateQueries(['my-profile']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const onSubmit = (data) => saveMutation.mutate(data);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'links', label: 'Social Links', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Profile</h1>
        <p className="text-dark-500 mt-1">Keep your profile up to date for better opportunities</p>
      </div>

      {/* Profile Completeness */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-dark-500">{user?.email}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-dark-500">Profile strength</span>
                  <span className="font-medium text-dark-700 dark:text-dark-300">{profile?.profileCompleteness || 0}%</span>
                </div>
                <div className="h-2 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (profile?.profileCompleteness || 0) > 70
                        ? 'bg-secondary-500'
                        : 'bg-primary-500'
                    }`}
                    style={{ width: `${profile?.profileCompleteness || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-200 dark:border-dark-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-6 space-y-4"
          >
            <Input
              label="Professional Headline"
              placeholder="e.g. Senior React Developer | 5+ Years Experience"
              icon={Briefcase}
              {...register('headline')}
              error={errors.headline?.message}
            />
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Summary
              </label>
              <textarea
                rows={5}
                placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                className="input-field resize-none"
                {...register('summary')}
              />
              {errors.summary && <p className="text-sm text-red-500 mt-1">{errors.summary.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Phone"
                placeholder="+91 XXXXX XXXXX"
                icon={Phone}
                {...register('phone')}
              />
              <Input
                label="Location"
                placeholder="Mumbai, India"
                icon={MapPin}
                {...register('location')}
              />
            </div>
          </motion.div>
        )}

        {/* Skills */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Skills
              </label>
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
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="pr-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 p-0.5 rounded hover:bg-dark-200 dark:hover:bg-dark-600"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-dark-400">No skills added yet</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Social Links */}
        {activeTab === 'links' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-6 space-y-4"
          >
            <Input
              label="LinkedIn"
              placeholder="https://linkedin.com/in/yourprofile"
              icon={Linkedin}
              {...register('socialLinks.linkedin')}
              error={errors.socialLinks?.linkedin?.message}
            />
            <Input
              label="GitHub"
              placeholder="https://github.com/yourusername"
              icon={Github}
              {...register('socialLinks.github')}
              error={errors.socialLinks?.github?.message}
            />
            <Input
              label="Portfolio"
              placeholder="https://yourwebsite.com"
              icon={Globe}
              {...register('socialLinks.portfolio')}
              error={errors.socialLinks?.portfolio?.message}
            />
          </motion.div>
        )}

        <div className="flex justify-end mt-6">
          <Button type="submit" isLoading={saveMutation.isPending}>
            <Save size={16} /> Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
