import React, { useState, useEffect } from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { useAuth } from '../contexts/AuthContext';
import InstructorService from '../services/InstructorService';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  FileText,
  User,
  Phone,
  Globe,
  BookOpen,
  Award,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const BecomeInstructorPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [canApply, setCanApply] = useState(true);
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    education: '',
    portfolio: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      youtube: ''
    },
    vodafoneCashNumber: '',
    nationalId: '',
    cv: '',
    certificates: [],
    motivation: ''
  });

  useEffect(() => {
    if (currentUser) {
      checkApplicationStatus();
    }
  }, [currentUser]);

  const checkApplicationStatus = async () => {
    try {
      // Check if user can apply
      const canApplyResult = await InstructorService.canUserApply(currentUser.uid);
      if (canApplyResult.success) {
        setCanApply(canApplyResult.canApply);
        
        if (!canApplyResult.canApply) {
          toast.error(canApplyResult.reason);
        }
      }

      // Get existing application if any
      const applicationResult = await InstructorService.getApplicationByUserId(currentUser.uid);
      if (applicationResult.success) {
        setApplicationStatus(applicationResult.application);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please log in first');
      return;
    }

    if (!canApply) {
      toast.error('You cannot apply at the current time');
      return;
    }

    setLoading(true);

    try {
      const applicationData = {
        ...formData,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'New User'
      };

      const result = await InstructorService.submitApplication(applicationData, currentUser.uid);
      
      if (result.success) {
        toast.success('Your application has been submitted successfully! It will be reviewed within 48 hours');
        setApplicationStatus(result.application);
        setCanApply(false);
      } else {
        toast.error('An error occurred while submitting the request: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting the request');
    }

    setLoading(false);
  };

  if (!currentUser) {
    return (
      <>
        <Navigation />
        <main className="pt-20 min-h-screen">
          <div className="container mx-auto px-4 py-8 text-center">
            <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Please Login</h1>
            <p className="text-gray-400 mb-6">You must log in to apply as an instructor</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Become an Instructor at Nexus
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Join the team of certified instructors and share your expertise with thousands of students worldwide
            </p>
          </div>

          {/* Application Status */}
          {applicationStatus && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className={`border rounded-xl p-6 ${
                applicationStatus.status === 'pending' ? 'bg-yellow-900/20 border-yellow-700/30' :
                applicationStatus.status === 'approved' ? 'bg-green-900/20 border-green-700/30' :
                'bg-red-900/20 border-red-700/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  {applicationStatus.status === 'pending' && (
                    <Clock className="w-6 h-6 text-yellow-400" />
                  )}
                  {applicationStatus.status === 'approved' && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  {applicationStatus.status === 'rejected' && (
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  )}
                  <h3 className={`text-lg font-semibold ${
                    applicationStatus.status === 'pending' ? 'text-yellow-400' :
                    applicationStatus.status === 'approved' ? 'text-green-400' :
                    'text-red-400'
                  }`}>
                    {applicationStatus.status === 'pending' ? 'Your request is under review' :
                     applicationStatus.status === 'approved' ? 'Your request has been accepted!' :
                     'Your request has been rejected'}
                  </h3>
                </div>
                <p className="text-gray-300">
                  {applicationStatus.status === 'pending' 
                    ? 'Your application has been received and is under review by our team. We will respond to you within 48 hours.'
                    : applicationStatus.status === 'approved'
                    ? 'Congratulations! You have been accepted as an Instructor on Nexus Platform. You can now create your first courses.'
                    : 'Sorry, your request was not accepted at this time. You can apply again later.'}
                </p>
                {applicationStatus.reviewNotes && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400">
                      <strong>Reviewer Feedback:</strong> {applicationStatus.reviewNotes}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Application Date: {new Date(applicationStatus.applicationDate).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Share your expertise</h3>
              <p className="text-gray-400 text-sm">
                Teach thousands of students and help them achieve their educational goals
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn money</h3>
              <p className="text-gray-400 text-sm">
                Get 70% of your course profits with full marketing support
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional tools</h3>
              <p className="text-gray-400 text-sm">
                Use advanced platform to easily create and manage your courses
              </p>
            </div>
          </div>

          {/* Application Form */}
          {canApply && !applicationStatus && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Application to become an Instructor</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Specialization *</label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                          required
                        >
                          <option value="">Choose specialization</option>
                          <option value="programming">Programming and Computer Science</option>
                          <option value="physics">Physics</option>
                          <option value="math">Mathematics</option>
                          <option value="chemistry">Chemistry</option>
                          <option value="biology">Biology</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Vodafone Cash Number *</label>
                        <input
                          type="tel"
                          name="vodafoneCashNumber"
                          value={formData.vodafoneCashNumber}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="01xxxxxxxxx"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">National ID Number *</label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="National Number"
                        required
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Professional Information
                    </h3>

                    <div>
                      <label className="block text-white font-medium mb-2">Years of experience *</label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Write about your professional and work experience in your specialization field..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Educational qualifications *</label>
                      <textarea
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Write about your educational qualifications and certificates you have obtained..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Link to your previous work</label>
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Social Media Links (optional)
                    </h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">LinkedIn</label>
                        <input
                          type="url"
                          name="socialLinks.linkedin"
                          value={formData.socialLinks.linkedin}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Twitter</label>
                        <input
                          type="url"
                          name="socialLinks.twitter"
                          value={formData.socialLinks.twitter}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="https://twitter.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">YouTube</label>
                        <input
                          type="url"
                          name="socialLinks.youtube"
                          value={formData.socialLinks.youtube}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <label className="block text-white font-medium mb-2">Why do you want to become an Instructor at Nexus? *</label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Write about your motivations for teaching and how you will contribute to developing the platform..."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
                    >
                      {loading ? 'Sending...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Admission Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Requirements</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Experience of at least two years in the specialization field</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Appropriate educational qualification for the specialization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Proficiency in English language and effective communication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Commitment to educational quality standards</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Benefits Offered</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>70% of course sales revenue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Marketing support and sales follow-up</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Advanced content creation tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Free training on e-teaching</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BecomeInstructorPage;