
import React, { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeout, isActive }) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const circumference = 283; // 2 * π * r where r = 45
  
  // Calculate stroke-dashoffset based on time left
  const strokeDashoffset = circumference - (timeLeft / duration) * circumference;
  
  // Calculate color based on time left (green to yellow to red)
  const getColor = () => {
    const percentage = timeLeft / duration;
    if (percentage > 0.6) return '#10b981'; // green
    if (percentage > 0.3) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  useEffect(() => {
    // Reset timer when reactivated
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [isActive, duration]);

  useEffect(() => {
    if (!isActive) return;
    
    // Set up timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    // Clean up
    return () => clearInterval(timer);
  }, [isActive, onTimeout]);

  return (
    <div className="relative h-16 w-16">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="none"
        />
        
        {/* Timer circle */}
        <circle
          className="timer-circle"
          cx="50"
          cy="50"
          r="45"
          stroke={getColor()}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      
      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-medium">
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export default Timer;
