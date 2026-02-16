import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, Briefcase, FileText,
  MessageSquare, Star, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { notificationsAPI } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  application_received: FileText,
  application_update: Briefcase,
  job_match: Star,
  interview_scheduled: Clock,
  message: MessageSquare,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.getAll,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      toast.success('All marked as read');
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsAPI.delete(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Notifications</h1>
          <p className="text-dark-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck size={16} /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Bell;
              return (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`card p-4 flex items-start gap-4 transition-colors ${
                    !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-l-primary-500' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    !notif.isRead
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500'
                      : 'bg-dark-100 dark:bg-dark-800 text-dark-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      !notif.isRead
                        ? 'font-semibold text-dark-900 dark:text-white'
                        : 'text-dark-600 dark:text-dark-300'
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-dark-500 mt-0.5">{notif.message}</p>
                    <span className="text-xs text-dark-400 mt-1 block">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(notif._id)}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-primary-500 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(notif._id)}
                      className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
