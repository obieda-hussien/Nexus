import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  DollarSign, 
  Bell, 
  Settings,
  Plus
} from 'lucide-react';

const InstructorNavigation = ({ activeTab, setActiveTab, notificationCount = 0 }) => {
  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'courses', label: 'الكورسات', icon: BookOpen },
    { id: 'students', label: 'الطلاب', icon: Users },
    { id: 'earnings', label: 'الأرباح', icon: DollarSign },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: notificationCount },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-2 mt-8">
      <div className="flex space-x-1 space-x-reverse overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap relative
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <IconComponent className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InstructorNavigation;