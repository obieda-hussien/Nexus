import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Clock, Users, BookOpen, Award } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Pricing = () => {
  const [isRTL, setIsRTL] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    plan: ''
  });

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setIsRTL(dir === 'rtl');
  }, []);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: isRTL ? 'SAR 199' : '$199', // Kept currency localization
      period: '/month',
      description: 'Perfect for beginners',
      features: [
        'Access to 10 courses',
        'Certificate of completion',
        'Email support',
        'Downloadable resources'
      ],
      notIncluded: [
        'Live sessions',
        'Capstone project'
      ],
      popular: false,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: isRTL ? 'SAR 399' : '$399', // Kept currency localization
      period: '/month',
      description: 'Most popular',
      features: [
        'Access to all courses',
        'Weekly live sessions',
        'Certified certificate',
        '24/7 support',
        'Capstone project',
        'Private student community'
      ],
      notIncluded: [],
      popular: true,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: isRTL ? 'SAR 799' : '$799', // Kept currency localization
      period: '/month',
      description: 'For teams & organizations',
      features: [
        'Everything in Premium',
        'Custom training',
        'Dedicated account manager',
        'Detailed progress reports',
        'System integrations',
        'Volume pricing'
      ],
      notIncluded: [],
      popular: false,
      color: 'from-green-500 to-blue-600'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Registration successful!');
    setShowRegistration(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-primary-bg to-secondary-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">
              Pricing Plans
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Choose the plan that fits your learning needs and start your journey to excellence
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="relative"
            >
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-primary-bg px-4 py-1 rounded-full text-sm font-bold flex items-center">
                    <Star className="w-4 h-4 mr-1" aria-hidden="true" />
                    Most Popular
                  </div>
                </motion.div>
              )}

              <Card className={`h-full p-8 ${plan.popular ? 'border-2 border-neon-blue' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <BookOpen className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-text-secondary text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold gradient-text mb-1">
                    {plan.price}
                  </div>
                  <div className="text-text-secondary">{plan.period}</div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" aria-hidden="true" />
                      <span className="text-text-secondary">{feature}</span>
                    </motion.div>
                  ))}
                  {plan.notIncluded.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 opacity-50"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 0.5, x: 0 }}
                      transition={{ delay: (plan.features.length + index) * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <X className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                      <span className="text-text-secondary line-through">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? "gradient" : "primary"}
                  className="w-full"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setFormData(prev => ({ ...prev, plan: plan.name }));
                    setShowRegistration(true);
                  }}
                  aria-label={`Choose ${plan.name}`}
                >
                  Choose Plan
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Registration Modal */}
        <AnimatePresence>
          {showRegistration && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRegistration(false)} />
              
              <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Registration
                    </h3>
                    <p className="text-text-secondary">
                      Fill in your details to get started
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label='Full Name'
                      placeholder='Enter your full name'
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />

                    <Input
                      label='Email'
                      type="email"
                      placeholder='example@email.com'
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />

                    <Input
                      label='Phone Number'
                      placeholder={isRTL ? '+966 XX XXX XXXX' : '+1 XXX XXX XXXX'}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.gext.value)}
                      required
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">
                        Selected Plan
                      </label>
                      <div className="glass rounded-lg p-3 text-neon-blue font-medium">
                        {plans.find(p => p.id === selectedPlan)?.name}
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1"
                        onClick={() => setShowRegistration(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        className="flex-1"
                      >
                        Register
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default memo(Pricing);