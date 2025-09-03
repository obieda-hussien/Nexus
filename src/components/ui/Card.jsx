import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = `glass rounded-xl ${padding} ${className}`;
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? { 
      scale: 1.02, 
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transition: { duration: 0.3 }
    } : {}
  };
  
  return (
    <motion.div
      className={baseClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;