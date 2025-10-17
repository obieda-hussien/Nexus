import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';

// Import new instructor components
import InstructorHeader from '../components/instructor/InstructorHeader';
import InstructorNavigation from '../components/instructor/InstructorNavigation';
import OverviewTab from '../components/instructor/OverviewTab';
import CoursesTab from '../components/instructor/CoursesTab';
import CreateCourseTab from '../components/instructor/CreateCourseTab';
import StudentsTab from '../components/instructor/StudentsTab';
import ReviewsTab from '../components/instructor/ReviewsTab';
import EarningsTab from '../components/instructor/EarningsTab';
import NotificationsTab from '../components/instructor/NotificationsTab';
import SettingsTab from '../components/instructor/SettingsTab';

const InstructorDashboard = () => {
  const { currentUser, canCreateCourses, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [instructorData, setInstructorData] = useState({});
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Redirect non-instructors to upgrade page
  if (!canCreateCourses()) {
    return (
      <>
        <Navigation />
        <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          <div className="container mx-auto px-4 py-8">
            <CreateCourseTab onCourseCreated={() => {}} onCancel={() => {}} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  useEffect(() => {
    if (currentUser?.uid) {
      loadInstructorData();
      loadCourses();
      loadstudents();
      loadEarnings();
      loadNotifications();
    }
  }, [currentUser]);

  const loadInstructorData = () => {
    const instructorRef = ref(db, `users/${currentUser.uid}/instructorData`);
    onValue(instructorRef, (snapshot) => {
      setInstructorData(snapshot.val() || {});
    });
  };

  const loadCourses = () => {
    const coursesRef = query(
      ref(db, 'courses'),
      orderByChild('instructorId'),
      equalTo(currentUser.uid)
    );
    onValue(coursesRef, (snapshot) => {
      const coursesData = [];
      snapshot.forEach((childSnapshot) => {
        coursesData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setCourses(coursesData);
    });
  };

  const loadstudents = () => {
    const enrollmentsRef = ref(db, 'enrollments');
    onValue(enrollmentsRef, (snapshot) => {
      const studentsData = [];
      snapshot.forEach((childSnapshot) => {
        const enrollment = childSnapshot.val();
        // Filter enrollments for instructor's courses
        const instructorCourse = courses.find(course => course.id === enrollment.courseId);
        if (instructorCourse) {
          studentsData.push({
            id: childSnapshot.key,
            ...enrollment
          });
        }
      });
      setStudents(studentsData);
    });
  };

  const loadEarnings = () => {
    // Calculate total earnings from courses
    const totalEarnings = courses.reduce((total, course) => total + (course.totalRevenue || 0), 0);
    setEarnings(totalEarnings);
  };

  const loadNotifications = () => {
    const notificationsRef = ref(db, `notifications/${currentUser.uid}`);
    onValue(notificationsRef, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((childSnapshot) => {
        notificationsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setNotifications(notificationsData);
    });
  };

  const handleCreateCourse = () => {
    setActiveTab('create-course');
  };

  const handleCourseCreated = () => {
    setActiveTab('courses');
    loadCourses(); // Refresh courses list
  };

  const handleEditCourse = (course) => {
    // Course editing is now handled within CoursesTab via EditCourseModal
    console.log('Edit course:', course);
  };

  const handleUpdateCourse = (updatedCourse) => {
    // Update the course in local state when edited
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  const handleDeleteCourse = async (courseId) => {
    // Update local state when course is deleted
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      const notificationRef = ref(db, `notifications/${currentUser.uid}/${notificationId}`);
      await update(notificationRef, {
        isRead: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const instructorRef = ref(db, `users/${currentUser.uid}/instructorData`);
      await update(instructorRef, updates);
      setInstructorData(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Update earnings when courses change
  useEffect(() => {
    loadEarnings();
  }, [courses]);

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <InstructorHeader 
            instructor={instructorData} 
            user={currentUser}
            onCreateCourse={handleCreateCourse}
          />

          {/* Navigation Tabs */}
          <InstructorNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            notificationCount={notifications.filter(n => !n.isRead).length}
          />

          {/* Main Content */}
          <div className="mt-8">
            {activeTab === 'overview' && (
              <OverviewTab 
                instructorData={instructorData}
                courses={courses}
                students={students}
                earnings={earnings}
              />
            )}
            
            {activeTab === 'courses' && (
              <CoursesTab 
                courses={courses}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onUpdateCourse={handleUpdateCourse}
              />
            )}
            
            {activeTab === 'create-course' && (
              <CreateCourseTab 
                onCourseCreated={handleCourseCreated}
                onCancel={() => setActiveTab('courses')}
              />
            )}
            
            {activeTab === 'students' && (
              <StudentsTab 
                students={students}
                courses={courses}
              />
            )}
            
            {activeTab === 'reviews' && (
              <ReviewsTab 
                courses={courses}
              />
            )}
            
            {activeTab === 'earnings' && (
              <EarningsTab 
                earnings={earnings}
                courses={courses}
                onSwitchToSettings={() => setActiveTab('settings')}
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationsTab 
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab 
                instructorData={instructorData}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default InstructorDashboard;