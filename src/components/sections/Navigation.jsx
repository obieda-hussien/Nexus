import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, Users, Award, Phone, User, LogIn, UserCircle, Settings, Bell, Briefcase } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import UserDashboard from '../auth/UserDashboard';
import SettingsPage from '../auth/SettingsPage';
import FirebaseDiagnostic from '../auth/FirebaseDiagnostic';
import InstructorApplicationPage from '../../pages/InstructorApplicationPage';
import NotificationCenter from '../notifications/NotificationCenter';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showInstructorApplication, setShowInstructorApplication] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { currentUser, logout } = useAuth();

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
      label: 'Courses', 
      icon: BookOpen,
      href: '#courses' 
    },
    { 
      id: 'about', 
      label: 'About', 
      icon: Users,
      href: '#about' 
    },
    { 
      id: 'apply-instructor', 
      label: 'Apply as Instructor', 
      icon: Briefcase,
      action: () => setShowInstructorApplication(true),
      requireAuth: true
    },
    { 
      id: 'contact', 
      label: 'Contact', 
      icon: Phone,
      href: '#contact' 
    }
  ];

  const handleAuthAction = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
            <span className="text-xl font-bold gradient-text">Nexus</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              if (item.action) {
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      console.log('Desktop Apply Instructor clicked');
                      item.action();
                    }}
                    className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300"
                    whileHover={{ scale: 1.05, color: '#00d4ff' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Go to ${item.label}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              }
              
              return (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05, color: '#00d4ff' }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Go to ${item.label}`}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </motion.a>
              );
            })}
            
            {/* Authentication Section */}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('Notifications button clicked');
                    setShowNotifications(true);
                  }}
                  className="relative flex items-center space-x-2"
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Button>
                
                {/* User Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDashboard(true)}
                  className="flex items-center space-x-2"
                >
                  <UserCircle size={16} />
                  <span>{currentUser.displayName || 'User'}</span>
                </Button>
                
                {/* Settings Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Settings button clicked');
                    setShowSettings(true);
                  }}
                  className="text-neon-blue hover:bg-glass-bg p-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
                  title="الإعدادات"
                >
                  <Settings size={16} />
                </button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthAction('login')}
                  className="flex items-center space-x-2"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Button>
                <Button 
                  variant="gradient" 
                  size="sm"
                  onClick={() => handleAuthAction('register')}
                >
                  Join Now
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-neon-blue transition-colors duration-300"
              whileTap={{ scale: 0.95 }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
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
                  
                  if (item.requireAuth && !currentUser) {
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          handleAuthAction('login');
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300 py-2"
                        whileHover={{ x: 5 }}
                        aria-label={`Go to ${item.label}`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  }
                  
                  if (item.action) {
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300 py-2"
                        whileHover={{ x: 5 }}
                        aria-label={`Go to ${item.label}`}
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  }
                  
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors duration-300 py-2"
                      onClick={() => setIsOpen(false)}
                      whileHover={{ x: 5 }}
                      aria-label={`Go to ${item.label}`}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span>{item.label}</span>
                    </motion.a>
                  );
                })}
                
                <div className="flex space-x-2 pt-4 border-t border-glass-border">
                  {currentUser ? (
                    <div className="flex space-x-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNotifications(true);
                          setIsOpen(false);
                        }}
                        className="flex-1"
                      >
                        <Bell size={16} className="ml-1" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowDashboard(true);
                          setIsOpen(false);
                        }}
                        className="flex-1"
                      >
                        <UserCircle size={16} className="ml-1" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowSettings(true);
                          setIsOpen(false);
                        }}
                        className="flex-1"
                      >
                        <Settings size={16} className="ml-1" />
                        الإعدادات
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="flex-1"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleAuthAction('login');
                          setIsOpen(false);
                        }}
                        className="flex-1"
                      >
                        Login
                      </Button>
                      <Button 
                        variant="gradient" 
                        size="sm"
                        onClick={() => {
                          handleAuthAction('register');
                          setIsOpen(false);
                        }}
                        className="flex-1"
                      >
                        Join
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />

      {/* User Dashboard */}
      <UserDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />

      {/* Settings Page */}
      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentTab="profile"
      />

      {/* Firebase Diagnostic Modal */}
      <FirebaseDiagnostic
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
      />

      {/* Instructor Application Modal */}
      <InstructorApplicationPage
        isOpen={showInstructorApplication}
        onClose={() => setShowInstructorApplication(false)}
      />

      {/* Notifications Modal */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </motion.nav>
  );
};

export default Navigation;