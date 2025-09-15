import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

/**
 * LoadingSpinner component with different variants and sizes
 */
const LoadingSpinner = ({
  size = 'default',
  variant = 'spinner',
  className = '',
  text = '',
  progress = null, // 0-100 for progress bar
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'progress' && progress !== null) {
    return (
      <div className={cn('w-full space-y-2', className)} {...props}>
        {text && (
          <div className="flex justify-between items-center">
            <span className={cn('text-muted-foreground', textSizeClasses[size])}>
              {text}
            </span>
            <span className={cn('text-muted-foreground', textSizeClasses[size])}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-1', className)} {...props}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-primary rounded-full animate-pulse',
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
        {text && (
          <span className={cn('ml-2 text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn('flex items-center space-x-2', className)} {...props}>
      <div className={cn('animate-spin', sizeClasses[size])}>
        <Icon name="Loader2" className="w-full h-full" />
      </div>
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * CalculationLoader - Specific loader for calculations with steps
 */
export const CalculationLoader = ({ 
  currentStep = '', 
  steps = [], 
  progress = 0,
  className = '' 
}) => {
  return (
    <div className={cn('bg-card border rounded-lg p-4 space-y-4', className)}>
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="font-medium text-foreground">Beräknar...</span>
      </div>
      
      {currentStep && (
        <p className="text-sm text-muted-foreground">
          {currentStep}
        </p>
      )}
      
      {steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = (progress / 100) * steps.length > index;
            const isCurrent = Math.floor((progress / 100) * steps.length) === index;
            
            return (
              <div key={index} className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isCompleted ? 'bg-success' : isCurrent ? 'bg-primary animate-pulse' : 'bg-muted'
                )} />
                <span className={cn(
                  'text-xs',
                  isCompleted ? 'text-success' : isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <LoadingSpinner variant="progress" progress={progress} />
    </div>
  );
};

export default LoadingSpinner;