import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Clock, 
  Briefcase, 
  CalendarCheck, 
  CheckCircle, 
  ArrowRightCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function EmployeeDashboard() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    const storedCheckIn = localStorage.getItem("checkInTime");
    if (storedCheckIn) {
      setCheckedIn(true);
      setCheckInTime(storedCheckIn);
    }
  }, []);

  const handleCheckInOut = () => {
    if (!checkedIn) {
      const now = new Date().toLocaleTimeString();
      localStorage.setItem("checkInTime", now);
      setCheckInTime(now);
    } else {
      localStorage.removeItem("checkInTime");
      setCheckInTime(null);
    }
    setCheckedIn(!checkedIn);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Welcome back, John</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Track your daily progress and activities</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-gray-600 dark:text-gray-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Check-in Card - Highlighted */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <Card className={`border-0  rounded-xl shadow-xl overflow-hidden ${
          checkedIn ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
        }`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-lg">
                  {checkedIn ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <ArrowRightCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {checkedIn ? 'Currently Working' : 'Start Your Day'}
                  </h2>
                  <p className="text-white/80">
                    {checkedIn ? `Checked in at ${checkInTime}` : "Ready to begin? Check in now"}
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={handleCheckInOut}
                className={`w-full md:w-auto text-lg font-semibold shadow-lg ${
                  checkedIn 
                    ? 'bg-white text-red-500 hover:bg-gray-100' 
                    : 'bg-white text-blue-500 hover:bg-gray-100'
                }`}
              >
                {checkedIn ? 'End Work Day' : 'Check In'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tasks Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Progress</p>
                <h3 className="text-2xl font-bold mt-2">5 Tasks</h3>
                <div className="mt-4">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all duration-500" 
                      style={{ width: '60%' }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">3 completed of 5 tasks</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                <Briefcase className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Hours</p>
                <h3 className="text-2xl font-bold mt-2">120 Hours</h3>
                <div className="flex items-center mt-4 text-emerald-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+8% from last month</span>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Leave</p>
                <h3 className="text-2xl font-bold mt-2">2 Days</h3>
                <div className="flex items-center mt-4 text-orange-500">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Starting tomorrow</span>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                <CalendarCheck className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Section */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="text-xl font-semibold">Latest Updates</h3>
            </div>
            <Button variant="ghost" className="text-blue-500 hover:text-blue-600">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Company Event This Friday! 🎉</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Join us for the annual team building event at Central Park</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Q4 Reports Due 📊</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Please submit your quarterly reports by next Monday</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}