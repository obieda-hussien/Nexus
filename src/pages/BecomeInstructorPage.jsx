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
      toast.error('Please Login first');
      return;
    }

    if (!canApply) {
      toast.error('لا يمكنك التOld في الوقت الحالي');
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
        toast.success('تم Submit طلبك بنجاح! سيتم مراجعته خلال 48 ساعة');
        setApplicationStatus(result.application);
        setCanApply(false);
      } else {
        toast.error('An error occurred أثناء Submit الطلب: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred أثناء Submit الطلب');
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
            <h1 className="text-2xl font-bold text-white mb-2">يرجى Login</h1>
            <p className="text-gray-400 mb-6">يجب Login للتOld كمدرس</p>
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
              كن مدرساً في Nexus
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              انضم إلى فريق Instructorين المعتمدين وشارك خبرتك مع آلاف Students حول العالم
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
                    {applicationStatus.status === 'pending' ? 'طلبك قيد المراجعة' :
                     applicationStatus.status === 'approved' ? 'Your request has been accepted!' :
                     'تم رفض طلبك'}
                  </h3>
                </div>
                <p className="text-gray-300">
                  {applicationStatus.status === 'pending' 
                    ? 'تم استلام طلبك وهو قيد المراجعة من قبل فريقنا. سيتم الرد عليك خلال 48 ساعة.'
                    : applicationStatus.status === 'approved'
                    ? 'مبروك! تم قبولك كمدرس في Nexus Platform. يمكنك الآن إنشاء كورساتك الأولى.'
                    : 'عذراً، لم يتم قبول طلبك في هذا الوقت. يمكنك التOld مرة أخرى لاحقاً.'}
                </p>
                {applicationStatus.reviewNotes && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400">
                      <strong>ملاحظات المراجع:</strong> {applicationStatus.reviewNotes}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  تاريخ التOld: {new Date(applicationStatus.applicationDate).toLocaleDateString('ar-EG')}
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
              <h3 className="text-lg font-semibold text-white mb-2">شارك معرفتك</h3>
              <p className="text-gray-400 text-sm">
                علم آلاف Students وساعدهم في تحقيق أهدافهم التعليمية
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">اكسب المال</h3>
              <p className="text-gray-400 text-sm">
                احصل على 70% من أرباح كورساتك مع دعم تسويقي كامل
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">أدوات احترافية</h3>
              <p className="text-gray-400 text-sm">
                استخدم منصة متطورة لإنشاء وإدارة كورساتك بسهولة
              </p>
            </div>
          </div>

          {/* Application Form */}
          {canApply && !applicationStatus && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">طلب أن تصبح مدرس</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      المعلومات الشخصية
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">التخصص *</label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                          required
                        >
                          <option value="">اختر التخصص</option>
                          <option value="programming">Programming وComputer Science</option>
                          <option value="physics">Physics</option>
                          <option value="math">Mathematics</option>
                          <option value="chemistry">Chemistry</option>
                          <option value="biology">الأحياء</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">رقم Vodafone Cash *</label>
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
                      <label className="block text-white font-medium mb-2">رقم الهوية الوطنية *</label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="الرقم القومي"
                        required
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      المعلومات المهنية
                    </h3>

                    <div>
                      <label className="block text-white font-medium mb-2">الخبرة العملية *</label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="اكتب عن خبرتك العملية والمهنية في مجال التخصص..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">المؤهل الدراسي *</label>
                      <textarea
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="اكتب عن مؤهلاتك الدراسية والشهادات الحاصل عليها..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">رابط أعمالك السابقة</label>
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
                      الروابط الاجتماعية (اختيارية)
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
                    <label className="block text-white font-medium mb-2">لماذا تريد أن تصبح مدرس في Nexus؟ *</label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="اكتب عن دوافعك للتدريس وكيف ستساهم في تطوير المنصة..."
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
                      {loading ? 'Sending...' : 'Submit الطلب'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">متطلبات القبول</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Requirements الأساسية</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>خبرة لا تقل عن سنتين في مجال التخصص</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>مؤهل تعليمي مناسب للتخصص</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>إجادة اللغة Arabic والتواصل الفعال</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>الالتزام بمعايير الجودة التعليمية</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">المزايا المقدمة</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>70% من عوائد بيع Courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>دعم تسويقي ومتابعة مبيعات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>أدوات إنشاء المحتوى المتطورة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>تدريب Free على التدريس الإلكتروني</span>
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