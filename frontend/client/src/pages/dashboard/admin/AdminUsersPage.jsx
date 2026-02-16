import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Users, Search, Shield, Ban, MoreVertical, Mail, Calendar,
  ChevronDown, UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => adminAPI.getUsers({ search, role: roleFilter, page }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries(['admin-users']);
      setSelectedUser(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;

  const roleColors = {
    applicant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    employer: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">User Management</h1>
        <p className="text-dark-500 mt-1">{total} registered users</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center flex-1 gap-2 bg-white dark:bg-dark-800 rounded-lg px-4 border border-dark-200 dark:border-dark-700">
          <Search size={18} className="text-dark-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full py-2.5 bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 outline-none text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">All Roles</option>
          <option value="applicant">Applicants</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-800">
                <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-4">Role</th>
                <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-4">Joined</th>
                <th className="text-right text-xs font-medium text-dark-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 rounded" /></td>
                  </tr>
                ))
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white text-sm">{u.name}</p>
                          <p className="text-xs text-dark-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        u.isActive !== false
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(u)}
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>

      {/* User Action Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Manage User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-dark-50 dark:bg-dark-800 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg font-bold text-white">
                {selectedUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-dark-900 dark:text-white">{selectedUser.name}</p>
                <p className="text-sm text-dark-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-center"
                onClick={() => updateMutation.mutate({
                  id: selectedUser._id,
                  data: { role: selectedUser.role === 'admin' ? 'applicant' : 'admin' },
                })}
              >
                <Shield size={16} />
                {selectedUser.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </Button>
              <Button
                variant={selectedUser.isActive !== false ? 'danger' : 'primary'}
                className="justify-center"
                onClick={() => updateMutation.mutate({
                  id: selectedUser._id,
                  data: { isActive: selectedUser.isActive === false },
                })}
              >
                {selectedUser.isActive !== false ? <Ban size={16} /> : <UserCheck size={16} />}
                {selectedUser.isActive !== false ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
