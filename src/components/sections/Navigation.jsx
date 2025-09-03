import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, Users, Award, Phone } from 'lucide-react';
import Button from '../ui/Button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      id: 'courses', 
      label: isRTL ? 'الدورات' : 'Courses', 
      icon: BookOpen,
      href: '#courses' 
    },
    { 
      id: 'about', 
      label: isRTL ? 'حولنا' : 'About', 
      icon: Users,
      href: '#about' 
    },
    { 
      id: 'instructor', 
      label: isRTL ? 'المدرس' : 'Instructor', 
      icon: Award,
      href: '#instructor' 
    },
    { 
      id: 'contact', 
      label: isRTL ? 'تواصل معنا' : 'Contact', 
      icon: Phone,
      href: '#contact' 
    }
  ];

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
    document.documentElement.setAttribute('dir', !isRTL ? 'rtl' : 'ltr');
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass backdrop-blur-md' : 'bg-transparent'
      }`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-xl font-bold gradient-text">
              {isRTL ? 'نيكسوس' : 'Nexus'}
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05, color: '#00d4ff' }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`${item.label} - ${isRTL ? 'اذهب إلى قسم' : 'Go to'} ${item.label}`}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </motion.a>
              );
            })}
            
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="ml-4"
              aria-label={isRTL ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
            >
              {isRTL ? 'EN' : 'عربي'}
            </Button>
            
            {/* CTA Button */}
            <Button variant="gradient" size="sm">
              {isRTL ? 'ابدأ الآن' : 'Get Started'}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-neon-blue transition-colors duration-300"
              whileTap={{ scale: 0.95 }}
              aria-label={isOpen ? (isRTL ? 'إغلاق القائمة' : 'Close menu') : (isRTL ? 'فتح القائمة' : 'Open menu')}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="glass rounded-lg mt-2 p-4 space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300 py-2"
                      onClick={() => setIsOpen(false)}
                      whileHover={{ x: 5 }}
                      aria-label={`${item.label} - ${isRTL ? 'اذهب إلى قسم' : 'Go to'} ${item.label}`}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span>{item.label}</span>
                    </motion.a>
                  );
                })}
                
                <div className="flex space-x-2 pt-4 border-t border-glass-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex-1"
                    aria-label={isRTL ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
                  >
                    {isRTL ? 'EN' : 'عربي'}
                  </Button>
                  <Button variant="gradient" size="sm" className="flex-1">
                    {isRTL ? 'ابدأ الآن' : 'Get Started'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;