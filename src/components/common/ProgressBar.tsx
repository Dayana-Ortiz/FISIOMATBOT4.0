import React from 'react';
import { motion } from 'framer-motion';
import './CommonStyles.css';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#4ECDC4',
  height = '10px',
  showLabel = false,
  animated = true
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-container">
      {showLabel && (
        <div className="progress-label">
          <span>{clampedProgress}%</span>
        </div>
      )}
      
      <div className="progress-bar-background" style={{ height }}>
        <motion.div
          className="progress-bar-fill"
          style={{ 
            backgroundColor: color,
            height: '100%'
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: animated ? 1 : 0,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;