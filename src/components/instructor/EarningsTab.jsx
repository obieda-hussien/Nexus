import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

const EarningsTab = ({ earnings, courses }) => {
  const [timeRange, setTimeRange] = useState('thisMonth');

  // Calculate earnings statistics
  const totalEarnings = earnings || 0;
  const courseEarnings = courses?.reduce((total, course) => total + (course.totalRevenue || 0), 0) || 0;
  const averagePerCourse = courses?.length > 0 ? courseEarnings / courses.length : 0;
  const topEarningCourse = courses?.reduce((top, course) => 
    (course.totalRevenue || 0) > (top?.totalRevenue || 0) ? course : top, null);

  // Mock data for charts - in real implementation, this would come from Firebase
  const monthlyEarnings = [
    { month: 'يناير', amount: 12000 },
    { month: 'فبراير', amount: 15000 },
    { month: 'مارس', amount: 18000 },
    { month: 'أبريل', amount: 14000 },
    { month: 'مايو', amount: 22000 },
    { month: 'يونيو', amount: 25000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">تحليل الأرباح</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="thisMonth">هذا الشهر</option>
            <option value="lastMonth">الشهر الماضي</option>
            <option value="thisYear">هذا العام</option>
            <option value="allTime">كل الوقت</option>
          </select>
        </div>

        {/* Earnings Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <EarningsCard
            title="إجمالي الأرباح"
            value={`${totalEarnings.toLocaleString()} ج.م`}
            icon={<DollarSign className="w-6 h-6" />}
            color="from-green-500 to-green-600"
            trend="+12%"
          />
          <EarningsCard
            title="أرباح هذا الشهر"
            value={`${(totalEarnings * 0.3).toLocaleString()} ج.م`}
            icon={<Calendar className="w-6 h-6" />}
            color="from-blue-500 to-blue-600"
            trend="+8%"
          />
          <EarningsCard
            title="متوسط أرباح الكورس"
            value={`${averagePerCourse.toLocaleString()} ج.م`}
            icon={<BarChart3 className="w-6 h-6" />}
            color="from-purple-500 to-purple-600"
            trend="+15%"
          />
          <EarningsCard
            title="معدل النمو"
            value="18.5%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="from-orange-500 to-orange-600"
            trend="+3%"
          />
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">مخطط الأرباح الشهرية</h3>
        <div className="space-y-4">
          {monthlyEarnings.map((data, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-purple-200 text-sm">{data.month}</div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" 
                    style={{ width: `${(data.amount / 25000) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-24 text-white text-sm font-medium text-left">
                {data.amount.toLocaleString()} ج.م
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Earning Courses */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">أعلى الكورسات ربحاً</h3>
          <div className="space-y-3">
            {courses?.slice(0, 5).map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{course.title}</p>
                    <p className="text-purple-200 text-xs">{course.studentsCount} طالب</p>
                  </div>
                </div>
                <div className="text-green-400 font-semibold">
                  {(course.totalRevenue || 0).toLocaleString()} ج.م
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">تفاصيل الأرباح</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">إجمالي المبيعات</span>
              <span className="text-white font-semibold">{totalEarnings.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">رسوم المنصة (10%)</span>
              <span className="text-red-400 font-semibold">-{(totalEarnings * 0.1).toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-purple-200">الضرائب (5%)</span>
              <span className="text-red-400 font-semibold">-{(totalEarnings * 0.05).toLocaleString()} ج.م</span>
            </div>
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between items-center p-3 bg-green-600/20 rounded-lg">
                <span className="text-white font-semibold">صافي الأرباح</span>
                <span className="text-green-400 font-bold text-lg">
                  {(totalEarnings * 0.85).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">معلومات الدفع</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-purple-200 mb-3">الدفع القادم</h4>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white font-semibold text-lg">{(totalEarnings * 0.25).toLocaleString()} ج.م</p>
              <p className="text-purple-200 text-sm">متوقع في 15 من الشهر القادم</p>
            </div>
          </div>
          <div>
            <h4 className="text-purple-200 mb-3">طريقة الدفع</h4>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white font-medium">حوالة بنكية</p>
              <p className="text-purple-200 text-sm">البنك الأهلي - ****1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EarningsCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <div className={`bg-gradient-to-r ${color} p-2 rounded-lg text-white`}>
        {icon}
      </div>
      {trend && (
        <span className="text-green-400 text-sm font-medium">{trend}</span>
      )}
    </div>
    <p className="text-purple-200 text-sm">{title}</p>
    <p className="text-white font-bold text-xl">{value}</p>
  </div>
);

export default EarningsTab;