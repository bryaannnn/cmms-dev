import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center fixed inset-0 w-full h-full bg-white/70 backdrop-blur-sm z-50">
      <div className="w-16 h-16 border-4 border-solid border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
