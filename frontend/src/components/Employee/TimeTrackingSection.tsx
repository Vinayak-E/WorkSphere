import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

import { Clock, TrendingUp } from "lucide-react";

const formatDuration = (milliseconds: number) => {
  if (isNaN(milliseconds) || milliseconds < 0) return "0h 0m";
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

export const TimeTrackingSection = ({
  checkedIn,
  checkInTime,
  elapsedTime,
  remainingTime,
}: {
  checkedIn: boolean;
  checkInTime: Date | null;
  elapsedTime: number;
  remainingTime: number;
}) => {
  if (!checkedIn) return null;

  const elapsedPercentage = Math.min((elapsedTime / 28800000) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="relative pt-2">
              <div className="flex mb-2 justify-between items-center">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Today's Progress
                </h3>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {elapsedPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${elapsedPercentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${elapsedPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Time Worked
                    </p>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(elapsedTime)}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {remainingTime > 0 ? "Remaining Time" : "Overtime"}
                    </p>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {remainingTime > 0
                        ? formatDuration(remainingTime)
                        : formatDuration(Math.abs(remainingTime))}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              {checkInTime && !isNaN(checkInTime.getTime())
                ? `Checked in at ${checkInTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}`
                : "Check-in time not available"}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
