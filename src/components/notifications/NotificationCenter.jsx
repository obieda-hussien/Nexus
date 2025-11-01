import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  BookOpen, 
  CreditCard, 
  Award,
  AlertCircle,
  Info,
  Star,
  Calendar,
  Mail,
  MessageCircle,
  Trash2,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue, update, set, push, remove } from 'firebase/database';
import { db } from '../../config/firebase';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNotifications();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter]);

  const loadNotifications = () => {
    if (!currentUser?.uid) return;

    const notificationsRef = ref(db, `notifications/${currentUser.uid}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.entries(data).map(([id, notification]) => ({
          id,
          ...notification
        })).sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
        
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const filterNotifications = () => {
    let filtered = [...notifications];
    
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(notif => !notif.read);
        break;
      case 'read':
        filtered = filtered.filter(notif => notif.read);
        break;
      case 'important':
        filtered = filtered.filter(notif => 
          ['instructor_approved', 'instructor_rejected', 'course_rejected', 'payment_failed'].includes(notif.type)
        );
        break;
      default:
        break;
    }
    
    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      await update(ref(db, `notifications/${currentUser.uid}/${notificationId}`), {
        read: true,
        readAt: Date.now()
      });
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      
      const updates = {};
      unreadNotifications.forEach(notif => {
        updates[notif.id] = {
          ...notif,
          read: true,
          readAt: Date.now()
        };
      });
      
      await update(ref(db, `notifications/${currentUser.uid}`), updates);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await remove(ref(db, `notifications/${currentUser.uid}/${notificationId}`));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await remove(ref(db, `notifications/${currentUser.uid}`));
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      instructor_approved: UserCheck,
      instructor_rejected: XCircle,
      course_submitted: BookOpen,
      course_approved: CheckCircle,
      course_rejected: XCircle,
      payment_success: CreditCard,
      payment_failed: AlertCircle,
      course_completed: Award,
      new_message: MessageCircle,
      system_update: Info,
      weekly_summary: Calendar,
      achievement_unlocked: Star,
      email_sent: Mail,
      default: Bell
    };

    const Icon = iconMap[type] || iconMap.default;
    return Icon;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      instructor_approved: 'text-green-400 bg-green-400/20',
      instructor_rejected: 'text-red-400 bg-red-400/20',
      course_submitted: 'text-blue-400 bg-blue-400/20',
      course_approved: 'text-green-400 bg-green-400/20',
      course_rejected: 'text-red-400 bg-red-400/20',
      payment_success: 'text-green-400 bg-green-400/20',
      payment_failed: 'text-red-400 bg-red-400/20',
      course_completed: 'text-yellow-400 bg-yellow-400/20',
      new_message: 'text-purple-400 bg-purple-400/20',
      system_update: 'text-blue-400 bg-blue-400/20',
      weekly_summary: 'text-indigo-400 bg-indigo-400/20',
      achievement_unlocked: 'text-orange-400 bg-orange-400/20',
      email_sent: 'text-teal-400 bg-teal-400/20',
      default: 'text-gray-400 bg-gray-400/20'
    };

    return colorMap[type] || colorMap.default;
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-primary-bg shadow-xl rounded-2xl border border-glass-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Bell className="text-neon-blue" size={24} />
                <div>
                  <h2 className="text-2xl font-bold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-400">
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={filter === 'all' ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="flex items-center space-x-2"
              >
                <Bell size={16} />
                <span>All ({notifications.length})</span>
              </Button>
              <Button
                variant={filter === 'unread' ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="flex items-center space-x-2"
              >
                <BellRing size={16} />
                <span>Unread ({unreadCount})</span>
              </Button>
              <Button
                variant={filter === 'important' ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setFilter('important')}
                className="flex items-center space-x-2"
              >
                <Star size={16} />
                <span>Important</span>
              </Button>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle size={16} />
                    <span>Mark All Read</span>
                  </Button>
                )}
              </div>
              
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteAllNotifications}
                  className="flex items-center space-x-2 text-red-400 border-red-400/30 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  <span>Clear All</span>
                </Button>
              )}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">Loading notifications...</span>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Found'}
                </h3>
                <p className="text-gray-400">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : "You don't have any notifications yet."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColor(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        glass p-4 rounded-xl border transition-all duration-200 hover:border-glass-border
                        ${notification.read ? 'opacity-75' : 'border-neon-blue/50 bg-neon-blue/5'}
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                          ${colorClasses}
                        `}>
                          <Icon size={18} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className={`
                                font-medium mb-1
                                ${notification.read ? 'text-gray-300' : 'text-white'}
                              `}>
                                {notification.title}
                              </h4>
                              <p className={`
                                text-sm mb-2
                                ${notification.read ? 'text-gray-400' : 'text-gray-300'}
                              `}>
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock size={12} />
                                  <span>{formatTimeAgo(notification.createdAt)}</span>
                                </div>
                                {!notification.read && (
                                  <span className="text-neon-blue font-medium">Unread</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-neon-blue hover:text-white transition-colors p-1"
                                  title="Mark as read"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Delete notification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationCenter;