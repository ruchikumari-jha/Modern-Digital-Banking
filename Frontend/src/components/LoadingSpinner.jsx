import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const variantClasses = {
  primary: 'text-blue-600',
  secondary: 'text-stone-600',
  white: 'text-white',
  danger: 'text-red-500',
  success: 'text-green-500',
};

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className,
  fullScreen = false,
  text = null
}) {
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center gap-3">
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant],
            className
          )} 
        />
        {text && (
            <span className={cn(
                "font-medium text-sm animate-pulse",
                variantClasses[variant] === 'text-white' ? 'text-white/90' : 'text-stone-500'
            )}>
                {text}
            </span>
        )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
