import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  className = '',
  dir = 'ltr',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  
  const inputClasses = `
    w-full px-4 py-3 glass rounded-lg text-white placeholder-text-secondary 
    border border-glass-border focus:border-neon-blue focus:outline-none 
    transition-all duration-300 backdrop-blur-md
    ${error ? 'border-red-500 focus:border-red-500' : ''}
    ${className}
  `;
  
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir={dir}
    >
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <motion.input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClasses}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      {error && (
        <motion.p 
          className="text-red-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;