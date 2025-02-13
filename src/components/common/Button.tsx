import React from 'react';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }

  


  export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    onClick,
    type = 'button',
    disabled = false,
  }) => {
    const baseStyles = 'rounded-lg font-semibold transition-all duration-200';
    
    const variants = {
      primary: 'bg-emerald-500 text-white hover:bg-emerald-600',
      secondary: 'bg-white text-emerald-600 hover:bg-emerald-50',
      outline: 'border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50'
    };
  
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
  
    return (
      <button
        type={type}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };