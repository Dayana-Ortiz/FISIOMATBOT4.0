import React from 'react';
import './CommonStyles.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
<<<<<<< HEAD
=======
  title?: string;
>>>>>>> master
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
  type = 'button',
<<<<<<< HEAD
  className = ''
=======
  className = '',
  title
>>>>>>> master
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'full-width' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
<<<<<<< HEAD
=======
      title={title}
>>>>>>> master
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;