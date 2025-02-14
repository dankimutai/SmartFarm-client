import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  containerClassName = '',
  className = '',
  id,
  required,
  disabled,
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Start Icon */}
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{startIcon}</span>
          </div>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`
            block w-full rounded-lg
            ${startIcon ? 'pl-10' : 'pl-4'}
            ${endIcon ? 'pr-10' : 'pr-4'}
            py-2.5
            text-gray-900
            border
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
            }
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition duration-150 ease-in-out
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error 
              ? `${inputId}-error` 
              : helperText 
                ? `${inputId}-helper` 
                : undefined
          }
          {...props}
        />

        {/* End Icon */}
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{endIcon}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';