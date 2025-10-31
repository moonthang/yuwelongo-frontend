import React from 'react';
import './Button.css';

export function Button({ children, onClick, type = "button", className = "", variant = "primary", size, disabled }) {
  
  const variantClasses = {
    primary: 'btn btn-primary',
    success: 'btn btn-success',
    secondary: 'btn btn-secondary',
    destructive: 'btn btn-danger',
    info: 'btn btn-info',
    warning: 'btn btn-warning text-dark'
  };

  const finalClassName = `
    ${variantClasses[variant] || variantClasses.primary}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClassName}
    >
      {children}
    </button>
  );
}