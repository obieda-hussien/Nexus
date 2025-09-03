import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'glass neon-glow text-white hover:bg-opacity-20',
    secondary: 'bg-secondary-bg border border-glass-border text-white hover:bg-opacity-80',
    ghost: 'text-neon-blue hover:bg-glass-bg',
    gradient: 'bg-accent-gradient text-white shadow-lg hover:shadow-xl'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;