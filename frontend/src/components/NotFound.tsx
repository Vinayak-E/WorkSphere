import { Home, BackpackIcon } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const handleBackButton = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(-1);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-4xl font-semibold text-gray-600 mt-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mt-4 mb-8">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 text-gray-500">
                What would you like to do?
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
