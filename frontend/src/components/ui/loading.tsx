import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className,
  fullScreen = false,
}) => {
  const { t } = useTranslation();
  const defaultText = text || t('hardcoded.loadingText');
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={t('hardcoded.loadingAriaLabel')}
    >
      <span className="sr-only">{defaultText}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {defaultText && (
            <p className="text-gray-600 text-sm font-medium">{defaultText}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {spinner}
      {defaultText && (
        <p className="text-gray-600 text-sm">{defaultText}</p>
      )}
    </div>
  );
};

// Suspense wrapper component
export const SuspenseWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <React.Suspense fallback={fallback || <Loading />}>
    {children}
  </React.Suspense>
);

export default Loading;
