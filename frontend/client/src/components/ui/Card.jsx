import { cn } from '@/lib/utils';

export function Card({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 shadow-sm',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('px-6 py-4 border-b border-dark-200 dark:border-dark-700', className)}>{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={cn('px-6 py-4 border-t border-dark-200 dark:border-dark-700', className)}>{children}</div>;
}
