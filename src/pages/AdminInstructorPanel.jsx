import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Award,
  BookOpen,
  Search,
  Filter,
  Download,
  MessageCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ref, onValue, update, set, push } from 'firebase/database';
import { db } from '../config/firebase';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const AdminInstructorPanel = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (isOpen && currentUser) {
      loadApplications();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, filterStatus, searchTerm, sortBy, sortOrder]);

  const loadApplications = () => {
    const applicationsRef = ref(db, 'instructorApplications');
    
    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applicationsList = Object.entries(data).map(([id, app]) => ({
          id,
          ...app
        }));
        setApplications(applicationsList);
      } else {
        setApplications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.profession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredApplications(filtered);
  };

  const handleReview = async (applicationId, action) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      const reviewData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewerId: currentUser.uid,
        reviewerEmail: currentUser.email,
        reviewDate: Date.now(),
        reviewNotes: reviewNotes,
        rejectionReason: action === 'reject' ? rejectionReason : null,
        updatedAt: Date.now()
      };

      // Update application status
      await update(ref(db, `instructorApplications/${applicationId}`), reviewData);

      // Update user profile
      if (action === 'approve') {
        await update(ref(db, `users/${application.userId}`), {
          userType: 'instructor',
          instructorApplication: {
            status: 'approved',
            applicationId: applicationId,
            approvedAt: Date.now()
          },
          updatedAt: Date.now()
        });

        // Create instructor profile
        await set(ref(db, `instructors/${application.userId}`), {
          userId: application.userId,
          email: application.email,
          firstName: application.firstName,
          lastName: application.lastName,
          phone: application.phone,
          bio: application.bio,
          profession: application.profession,
          experience: application.experience,
          qualifications: application.qualifications,
          certificates: application.certificates,
          expertise: application.expertise || [],
          languages: application.languages || [],
          teachingExperience: application.teachingExperience,
          subjects: application.subjects,
          teachingStyle: application.teachingStyle,
          availability: application.availability,
          motivation: application.motivation,
          expectations: application.expectations,
          references: application.references,
          status: 'active',
          createdAt: Date.now(),
          approvalDate: Date.now(),
          approvedBy: currentUser.uid,
          totalCourses: 0,
          totalStudents: 0,
          averageRating: 0,
          totalEarnings: 0
        });

        // Create notification for user
        const notificationsRef = ref(db, `notifications/${application.userId}`);
        const newNotificationRef = push(notificationsRef);
        await set(newNotificationRef, {
          id: newNotificationRef.key,
          type: 'instructor_approved',
          title: 'Congratulations! Your instructor application has been approved',
          message: 'Your instructor application has been approved and you can now create and teach courses on Nexus.',
          read: false,
          createdAt: Date.now(),
          actionUrl: '/instructor'
        });

        toast.success('Application approved and instructor profile created!');
      } else {
        // Update user profile with rejection
        await update(ref(db, `users/${application.userId}`), {
          userType: 'student',
          instructorApplication: {
            status: 'rejected',
            applicationId: applicationId,
            rejectedAt: Date.now(),
            rejectionReason: rejectionReason
          },
          updatedAt: Date.now()
        });

        // Create notification for user
        const notificationsRef = ref(db, `notifications/${application.userId}`);
        const newNotificationRef = push(notificationsRef);
        await set(newNotificationRef, {
          id: newNotificationRef.key,
          type: 'instructor_rejected',
          title: 'Your instructor application has been reviewed',
          message: `Thank you for your application. Unfortunately, it has not been approved at this time. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
          read: false,
          createdAt: Date.now(),
          actionUrl: '/become-instructor'
        });

        toast.success('Application rejected and user notified.');
      }

      setReviewNotes('');
      setRejectionReason('');
      setShowDetailModal(false);
      
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
        icon: Clock,
        text: 'Pending'
      },
      approved: { 
        color: 'bg-green-500/20 text-green-400 border-green-400/30',
        icon: CheckCircle,
        text: 'Approved'
      },
      rejected: { 
        color: 'bg-red-500/20 text-red-400 border-red-400/30',
        icon: XCircle,
        text: 'Rejected'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon size={12} />
        <span>{config.text}</span>
      </span>
    );
  };

  const openDetailModal = (application) => {
    setSelectedApplication(application);
    setReviewNotes(application.reviewNotes || '');
    setRejectionReason(application.rejectionReason || '');
    setShowDetailModal(true);
  };

  const exportApplications = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Profession', 'Status', 'Applied Date', 'Review Date'].join(','),
      ...filteredApplications.map(app => [
        `${app.firstName} ${app.lastName}`,
        app.email,
        app.phone,
        app.profession,
        app.status,
        new Date(app.createdAt).toLocaleDateString(),
        app.reviewDate ? new Date(app.reviewDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instructor_applications.csv';
    a.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity"
            aria-hidden="true"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-black opacity-75"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-primary-bg shadow-xl rounded-2xl border border-glass-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="text-neon-blue" size={24} />
                <h2 className="text-2xl font-bold text-white">Instructor Management</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="glass p-4 rounded-xl border border-glass-border">
                <div className="flex items-center space-x-3">
                  <Clock className="text-yellow-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-white text-xl font-bold">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="glass p-4 rounded-xl border border-glass-border">
                <div className="flex items-center space-x-3">
                  <UserCheck className="text-green-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Approved</p>
                    <p className="text-white text-xl font-bold">
                      {applications.filter(app => app.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="glass p-4 rounded-xl border border-glass-border">
                <div className="flex items-center space-x-3">
                  <UserX className="text-red-400" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Rejected</p>
                    <p className="text-white text-xl font-bold">
                      {applications.filter(app => app.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="glass p-4 rounded-xl border border-glass-border">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-neon-purple" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-white text-xl font-bold">{applications.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-secondary-bg border border-glass-border rounded-xl text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none"
                  />
                </div>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-secondary-bg border border-glass-border rounded-xl text-white focus:border-neon-blue focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 bg-secondary-bg border border-glass-border rounded-xl text-white focus:border-neon-blue focus:outline-none"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="firstName-asc">Name A-Z</option>
                <option value="firstName-desc">Name Z-A</option>
              </select>
              
              <Button
                variant="outline"
                onClick={exportApplications}
                className="flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export</span>
              </Button>
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">Loading applications...</span>
                </div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Found</h3>
                <p className="text-gray-400">No instructor applications match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {filteredApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 rounded-xl border border-glass-border hover:border-neon-blue/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                          <UserCheck className="text-white" size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {application.firstName} {application.lastName}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                              <Mail size={14} />
                              <span>{application.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone size={14} />
                              <span>{application.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award size={14} />
                              <span>{application.profession}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {application.bio || 'No bio provided'}
                            </p>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(application.expertise || []).slice(0, 3).map((item, index) => (
                              <span
                                key={index}
                                className="bg-neon-blue/20 text-neon-blue px-2 py-1 rounded text-xs"
                              >
                                {item}
                              </span>
                            ))}
                            {(application.expertise || []).length > 3 && (
                              <span className="text-gray-400 text-xs">
                                +{(application.expertise || []).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(application)}
                          className="flex items-center space-x-1"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </Button>
                        
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => handleReview(application.id, 'approve')}
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle size={16} />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(application.id, 'reject')}
                              className="flex items-center space-x-1 text-red-400 border-red-400/30 hover:bg-red-500/20"
                            >
                              <XCircle size={16} />
                              <span>Reject</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedApplication && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setShowDetailModal(false)}
                >
                  <div className="absolute inset-0 bg-black opacity-75"></div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-primary-bg shadow-xl rounded-2xl border border-glass-border"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Application Details</h3>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <XCircle size={24} />
                    </button>
                  </div>

                  {/* Application Content */}
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="glass p-4 rounded-xl border border-glass-border">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <UserCheck className="mr-2 text-neon-blue" size={20} />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white ml-2">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white ml-2">{selectedApplication.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Phone:</span>
                          <span className="text-white ml-2">{selectedApplication.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">City:</span>
                          <span className="text-white ml-2">{selectedApplication.city}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Country:</span>
                          <span className="text-white ml-2">{selectedApplication.country}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Date of Birth:</span>
                          <span className="text-white ml-2">{selectedApplication.dateOfBirth || 'Not provided'}</span>
                        </div>
                      </div>
                      {selectedApplication.bio && (
                        <div className="mt-4">
                          <span className="text-gray-400">Bio:</span>
                          <p className="text-white mt-1">{selectedApplication.bio}</p>
                        </div>
                      )}
                    </div>

                    {/* Professional Background */}
                    <div className="glass p-4 rounded-xl border border-glass-border">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <GraduationCap className="mr-2 text-neon-purple" size={20} />
                        Professional Background
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-400">Profession:</span>
                          <span className="text-white ml-2">{selectedApplication.profession}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-white ml-2">{selectedApplication.experience}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Qualifications:</span>
                          <p className="text-white mt-1">{selectedApplication.qualifications}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Certificates:</span>
                          <p className="text-white mt-1">{selectedApplication.certificates}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div className="glass p-4 rounded-xl border border-glass-border">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Star className="mr-2 text-neon-green" size={20} />
                        Expertise & Languages
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-400">Areas of Expertise:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(selectedApplication.expertise || []).map((item, index) => (
                              <span
                                key={index}
                                className="bg-neon-blue/20 text-neon-blue px-3 py-1 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Languages:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(selectedApplication.languages || []).map((item, index) => (
                              <span
                                key={index}
                                className="bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Teaching Information */}
                    <div className="glass p-4 rounded-xl border border-glass-border">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <BookOpen className="mr-2 text-neon-green" size={20} />
                        Teaching Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-400">Teaching Experience:</span>
                          <span className="text-white ml-2">{selectedApplication.teachingExperience}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Subjects to Teach:</span>
                          <p className="text-white mt-1">{selectedApplication.subjects}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Teaching Style:</span>
                          <p className="text-white mt-1">{selectedApplication.teachingStyle}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Availability:</span>
                          <p className="text-white mt-1">{selectedApplication.availability}</p>
                        </div>
                      </div>
                    </div>

                    {/* Motivation */}
                    <div className="glass p-4 rounded-xl border border-glass-border">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <MessageCircle className="mr-2 text-neon-purple" size={20} />
                        Motivation & Expectations
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-400">Motivation:</span>
                          <p className="text-white mt-1">{selectedApplication.motivation}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Expectations:</span>
                          <p className="text-white mt-1">{selectedApplication.expectations}</p>
                        </div>
                        {selectedApplication.references && (
                          <div>
                            <span className="text-gray-400">References:</span>
                            <p className="text-white mt-1">{selectedApplication.references}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Review Section */}
                    {selectedApplication.status === 'pending' && (
                      <div className="glass p-4 rounded-xl border border-glass-border">
                        <h4 className="text-lg font-semibold text-white mb-4">Review Application</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Review Notes</label>
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="w-full px-4 py-3 bg-secondary-bg border border-glass-border rounded-xl text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none h-24"
                              placeholder="Add notes about this application..."
                            />
                          </div>
                          <div className="flex space-x-3">
                            <Button
                              variant="gradient"
                              onClick={() => handleReview(selectedApplication.id, 'approve')}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle size={16} />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleReview(selectedApplication.id, 'reject')}
                              className="flex items-center space-x-2 text-red-400 border-red-400/30 hover:bg-red-500/20"
                            >
                              <XCircle size={16} />
                              <span>Reject</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Existing Review */}
                    {(selectedApplication.status === 'approved' || selectedApplication.status === 'rejected') && selectedApplication.reviewNotes && (
                      <div className="glass p-4 rounded-xl border border-glass-border">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Edit3 className="mr-2 text-neon-blue" size={20} />
                          Review Notes
                        </h4>
                        <p className="text-white">{selectedApplication.reviewNotes}</p>
                        <div className="mt-2 text-sm text-gray-400">
                          Reviewed by: {selectedApplication.reviewerEmail}
                          <br />
                          Date: {new Date(selectedApplication.reviewDate).toLocaleDateString()}
                        </div>
                        {selectedApplication.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
                            <span className="text-red-400 text-sm font-medium">Rejection Reason:</span>
                            <p className="text-red-300 mt-1">{selectedApplication.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default AdminInstructorPanel;