import React from 'react';

const LoadingIndicator = ({ message = "Loading...", size = "medium" }) => {
  // Define different sizes
  const sizes = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-16 w-16"
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-b-2 border-green-500`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;