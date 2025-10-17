import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  BookOpen,
  Users,
  Award,
  ArrowUp
} from 'lucide-react';
import Button from '../ui/Button';

const Footer = () => {
  const [isRTL, setIsRTL] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setIsRTL(dir === 'rtl');

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerSections = [
    {
      title: isRTL ? 'الدورات' : 'Courses',
      links: [
        { name: isRTL ? 'Basic Physics' : 'Basic Physics', href: '#' },
        { name: isRTL ? 'Advanced Physics' : 'Advanced Physics', href: '#' },
        { name: isRTL ? 'Applied Mathematics' : 'Applied Mathematics', href: '#' },
        { name: isRTL ? 'الScience التجريبية' : 'Experimental Sciences', href: '#' }
      ]
    },
    {
      title: isRTL ? 'الشركة' : 'Company',
      links: [
        { name: isRTL ? 'حولنا' : 'About Us', href: '#' },
        { name: isRTL ? 'فريق العمل' : 'Our Team', href: '#' },
        { name: isRTL ? 'الوظائف' : 'Careers', href: '#' },
        { name: isRTL ? 'News' : 'News', href: '#' }
      ]
    },
    {
      title: isRTL ? 'Support' : 'Support',
      links: [
        { name: isRTL ? 'مركز Help' : 'Help Center', href: '#' },
        { name: isRTL ? 'FAQ' : 'FAQ', href: '#' },
        { name: isRTL ? 'تواصل withنا' : 'Contact Us', href: '#' },
        { name: isRTL ? 'حالة System' : 'System Status', href: '#' }
      ]
    },
    {
      title: isRTL ? 'قانوني' : 'Legal',
      links: [
        { name: isRTL ? 'Privacy Policy' : 'Privacy Policy', href: '#' },
        { name: isRTL ? 'شروط الاستخدام' : 'Terms of Service', href: '#' },
        { name: isRTL ? 'ملفات تعريف الارتباط' : 'Cookie Policy', href: '#' },
        { name: isRTL ? 'إخلاء المسؤولية' : 'Disclaimer', href: '#' }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: isRTL ? 'Email' : 'Email',
      value: 'info@nexus.edu',
      href: 'mailto:info@nexus.edu'
    },
    {
      icon: Phone,
      title: isRTL ? 'Phone' : 'Phone',
      value: isRTL ? '+20 2 123 4567' : '+20 2 123 4567',
      href: 'tel:+20212340567'
    },
    {
      icon: MapPin,
      title: isRTL ? 'Title' : 'Address',
      value: isRTL ? 'القاهرة، جمهورية مصر Arabic' : 'Cairo, Egypt',
      href: '#'
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-500', name: isRTL ? 'inسبوك' : 'Facebook' },
    { icon: Twitter, href: '#', color: 'hover:text-blue-400', name: isRTL ? 'تويتر' : 'Twitter' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-500', name: isRTL ? 'إنستغرام' : 'Instagram' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-600', name: isRTL ? 'لينكد إن' : 'LinkedIn' },
    { icon: Youtube, href: '#', color: 'hover:text-red-500', name: isRTL ? 'يوتيوب' : 'YouTube' }
  ];

  const stats = [
    { icon: Users, value: '10K+', label: isRTL ? 'student' : 'students' },
    { icon: BookOpen, value: '50+', label: isRTL ? 'دورة' : 'Courses' },
    { icon: Award, value: '25+', label: isRTL ? 'جائزة' : 'Awards' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <footer className="relative bg-gradient-to-t from-primary-bg to-secondary-bg">
      {/* Newsletter Section */}
      <div className="border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold gradient-text mb-4">
              {isRTL ? 'ابق on اطلاع' : 'Stay Updated'}
            </h3>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {isRTL 
                ? 'اشترك in Publishتنا الإخبارية للحصول on آخر News والدورات الNew'
                : 'Subscribe to our newsletter for the latest news and new courses'
              }
            </p>
          </motion.div>

          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex glass rounded-lg p-2">
              <input
                type="email"
                placeholder={isRTL ? 'Enter your email' : 'Enter your email'}
                className="flex-1 bg-transparent text-white placeholder-text-secondary px-4 py-2 focus:outline-none"
                dir={isRTL ? 'rtl' : 'ltr'}
                aria-label={isRTL ? 'aboutوان Email للاشتراك in الPublishة الإخبارية' : 'Email address for newsletter subscription'}
              />
              <Button 
                variant="gradient" 
                size="sm"
                aria-label={isRTL ? 'اشترك in الPublishة الإخبارية' : 'Subscribe to newsletter'}
              >
                {isRTL ? 'اشتراك' : 'Subscribe'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="text-2xl font-bold gradient-text">
                  {isRTL ? 'Nexus' : 'Nexus'}
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed mb-6">
                {isRTL 
                  ? 'fromصة تعليمية Recentة تهدف to تOld أفضل تجربة تعليمية in مجال Physics وMathematics للجيل الNew.'
                  : 'A modern educational platform aimed at providing the best learning experience in physics and mathematics for the new generation.'
                }
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="w-6 h-6 text-neon-blue mx-auto mb-2" />
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-text-secondary">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          <motion.div variants={itemVariants} className="lg:col-span-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <motion.a
                          href={link.href}
                          className="text-text-secondary hover:text-neon-blue transition-colors duration-300 text-sm"
                          whileHover={{ x: 2 }}
                        >
                          {link.name}
                        </motion.a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4">
              {isRTL ? 'مScienceات التواصل' : 'Contact Info'}
            </h4>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={index}
                    href={contact.href}
                    className="flex items-start space-x-3 text-text-secondary hover:text-white transition-colors duration-300"
                    whileHover={{ x: 2 }}
                    aria-label={`${contact.title}: ${contact.value}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-sm">{contact.title}</div>
                      <div className="text-sm">{contact.value}</div>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="text-white font-medium mb-3">
                {isRTL ? 'Followنا' : 'Follow Us'}
              </h5>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      className={`w-10 h-10 glass rounded-lg flex items-center justify-center text-text-secondary transition-all duration-300 ${social.color}`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`${isRTL ? 'Followنا on' : 'Follow us on'} ${social.name}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-text-secondary text-sm">
              {isRTL 
                ? `© ${new Date().getFullYear()} Nexus. جميع الحقوق محفوظة.`
                : `© ${new Date().getFullYear()} Nexus. All rights reserved.`
              }
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-text-secondary text-sm">
                {isRTL ? 'صُنع بـ' : 'Made with'}
              </span>
              <span className="text-red-500">❤️</span>
              <span className="text-text-secondary text-sm">
                {isRTL ? 'in مصر' : 'in Egypt'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 glass rounded-full flex items-center justify-center text-neon-blue hover:text-white transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollTop ? 1 : 0 }}
        aria-label={isRTL ? 'العودة to أon الصفحة' : 'Scroll to top of page'}
      >
        <ArrowUp size={20} aria-hidden="true" />
      </motion.button>
    </footer>
  );
};

export default memo(Footer);