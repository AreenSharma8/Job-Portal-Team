import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Briefcase, Users, FileText, Settings,
  Building2, PlusCircle, ClipboardList,
  UserCircle, Bookmark, Bell, Search,
} from 'lucide-react';

const sidebarLinks = {
  applicant: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobs', icon: Search, label: 'Find Jobs' },
    { to: '/dashboard/applications', icon: ClipboardList, label: 'My Applications' },
    { to: '/dashboard/bookmarks', icon: Bookmark, label: 'Saved Jobs' },
    { to: '/dashboard/profile', icon: UserCircle, label: 'My Profile' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  ],
  employer: [
    { to: '/dashboard/employer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/post-job', icon: PlusCircle, label: 'Post a Job' },
    { to: '/dashboard/jobs', icon: Briefcase, label: 'My Jobs' },
    { to: '/dashboard/employer/applications', icon: ClipboardList, label: 'Applications' },
    { to: '/dashboard/company', icon: Building2, label: 'Company Profile' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  ],
  admin: [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/admin/users', icon: Users, label: 'Users' },
    { to: '/dashboard/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  ],
};

export default function Sidebar() {
  const { user } = useAuthStore();
  const role = user?.role || 'applicant';
  const links = sidebarLinks[role] || sidebarLinks.applicant;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700 hover:text-dark-900 dark:hover:text-dark-100'
              )
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
