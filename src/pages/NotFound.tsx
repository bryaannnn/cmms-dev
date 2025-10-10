import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Frown } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="relative inline-flex">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
              <Frown className="w-16 h-16 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">404</span>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">Oops! The page you're looking for seems to have wandered off into the digital void.</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
            <Home className="mr-2" />
            Back to Home
          </Link>

          <button onClick={() => window.history.back()} className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium">
            <ArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact the{" "}
            <Link to="#" className="text-blue-600 hover:underline">
              IT Department
            </Link>
          </p>
        </div>

        {/* Fun Animation */}
        <div className="mt-12">
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 w-1/3 animate-ping-pong"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
