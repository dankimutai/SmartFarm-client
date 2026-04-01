// src/components/common/Alert.tsx
import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X as CloseIcon 
} from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const variantStyles = {
  success: {
    wrapper: 'bg-green-50 border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700',
    Icon: CheckCircle,
  },
  error: {
    wrapper: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
    Icon: XCircle,
  },
  warning: {
    wrapper: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    Icon: AlertTriangle,
  },
  info: {
    wrapper: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
    Icon: Info,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-start p-4 border rounded-lg ${styles.wrapper} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <styles.Icon className={`w-5 h-5 ${styles.icon}`} />
      </div>
      <div className="ml-3 flex-1">
        <h3 className={`text-sm font-medium ${styles.title}`}>
          {title}
        </h3>
        <div className={`mt-1 text-sm ${styles.message}`}>
          {message}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 ${styles.icon} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
