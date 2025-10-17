import React, { useState } from 'react';
import { Bell, Check, X, AlertCircle, Info, Star, Users } from 'lucide-react';

const NotificationsTab = ({ notifications, onMarkAsRead }) => {
  const [filter, setFilter] = useState('all');

  // Mock notifications if none provided
  const defaultNotifications = [
    {
      id: 1,
      type: 'review',
      title: 'تقييم New على كورسك',
      message: 'حصل كورس "Basic Physics" على تقييم 5 نجوم من الStudent أحمد محمد',
      time: '10 دقائق',
      isRead: false,
      icon: Star
    },
    {
      id: 2,
      type: 'enrollment',
      title: 'تسجيل طلاب جدد',
      message: '15 Student New انضموا لكورس "النسبية المتخصصة"',
      time: '30 minutes',
      isRead: false,
      icon: Users
    },
    {
      id: 3,
      type: 'system',
      title: 'Update في النظام',
      message: 'تم Add ميزات Newة لCourse Management',
      time: '2 hours',
      isRead: true,
      icon: Info
    },
    {
      id: 4,
      type: 'alert',
      title: 'مراجعة مطلوبة',
      message: 'كورس "ميكانيكا الكم" في انتظار مراجعة المحتوى',
      time: '3 ساعات',
      isRead: false,
      icon: AlertCircle
    }
  ];

  const notificationsList = notifications || defaultNotifications;

  const filteredNotifications = notificationsList.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notificationsList.filter(n => !n.isRead).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'review':
        return 'bg-yellow-500';
      case 'enrollment':
        return 'bg-green-500';
      case 'system':
        return 'bg-blue-500';
      case 'alert':
        return 'bg-red-500';
      default:
        return 'bg-purple-500';
    }
  };

  const markAsRead = (notificationId) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const markAllAsRead = () => {
    notificationsList.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              تمييز All كمقروء
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-purple-200 hover:text-white'
            }`}
          >
            All ({notificationsList.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'unread' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-purple-200 hover:text-white'
            }`}
          >
            غير مقروء ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'read' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-purple-200 hover:text-white'
            }`}
          >
            مقروء ({notificationsList.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              getNotificationColor={getNotificationColor}
            />
          ))
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
            <Bell className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">لا توجد إشعارات</p>
            <p className="text-purple-200">
              {filter === 'unread' ? 'جميع Notifications مقروءة' : 'لا توجد إشعارات في هذا التصنيف'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationCard = ({ notification, onMarkAsRead, getNotificationColor }) => {
  const IconComponent = notification.icon || Bell;

  return (
    <div className={`
      bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 transition-all duration-200
      ${!notification.isRead ? 'border-purple-400 bg-purple-500/10' : ''}
    `}>
      <div className="flex items-start space-x-4 space-x-reverse">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white
          ${getNotificationColor(notification.type)}
        `}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold ${notification.isRead ? 'text-purple-200' : 'text-white'}`}>
              {notification.title}
            </h3>
            <span className="text-gray-400 text-xs">
              منذ {notification.time}
            </span>
          </div>
          <p className={`text-sm ${notification.isRead ? 'text-purple-300' : 'text-purple-100'}`}>
            {notification.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 space-x-reverse">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-green-400 hover:text-green-300 p-1"
              title="تمييز كمقروء"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            className="text-red-400 hover:text-red-300 p-1"
            title="Delete الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;