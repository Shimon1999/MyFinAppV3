import React from 'react';

const SparkBar = ({ data, color }) => {
  if (!data || data.length === 0) {
    return null;
  }
  
  const max = Math.max(...data, 1); // Ensure max is at least 1 to avoid division by zero
  const normalizedData = data.map(value => (value / max) * 100);
  
  return (
    <div className="flex items-end h-full gap-1">
      {normalizedData.map((height, index) => (
        <div
          key={index}
          style={{
            height: `${Math.max(height, 5)}%`, // Min height of 5% for visibility
            backgroundColor: color || 'currentColor',
            transition: 'height 0.3s ease'
          }}
          className="flex-1 rounded-sm"
        />
      ))}
    </div>
  );
};

export default SparkBar;