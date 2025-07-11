import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="flex justify-between items-end pt-3 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
