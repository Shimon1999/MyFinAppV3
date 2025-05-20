
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoader({ type }) {
  if (type === "category") {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-6 h-6 rounded bg-gray-200" />
            <Skeleton className="h-5 w-24 bg-gray-200" />
          </div>
          <Skeleton className="w-6 h-6 rounded bg-gray-200" />
        </div>
        <div className="mb-1">
          <div className="flex items-baseline justify-between">
            <Skeleton className="h-7 w-20 bg-gray-200" />
            <Skeleton className="h-4 w-16 bg-gray-200" />
          </div>
          <Skeleton className="h-2 mt-2 rounded-full bg-gray-200" />
        </div>
        <Skeleton className="h-3 w-28 mt-1 bg-gray-200" />
      </div>
    );
  }
  
  if (type === "goal") {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 p-5">
        <div className="flex">
          <Skeleton className="w-[100px] h-[100px] rounded-full mr-4" />
          
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            
            <div className="mb-2">
              <Skeleton className="h-6 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
