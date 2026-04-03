import React, { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import './CommonStyles.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  color?: string;
  style?: CSSProperties;
<<<<<<< HEAD
=======
  noPadding?: boolean;
>>>>>>> master
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  onClick,
  color,
<<<<<<< HEAD
  style
}) => {
  const cardStyle: CSSProperties = {
    ...style,
    ...(color ? { borderTop: `4px solid ${color}` } : {})
=======
  style,
  noPadding = false
}) => {
  const cardStyle: CSSProperties = {
    ...style,
    ...(color ? { borderTop: `4px solid ${color}` } : {}),
    ...(noPadding ? { padding: 0 } : {})
>>>>>>> master
  };

  return (
    <motion.div
<<<<<<< HEAD
      className={`card ${className} ${hoverable ? 'hoverable' : ''}`}
=======
      className={`card ${className} ${hoverable ? 'hoverable' : ''} ${noPadding ? 'no-padding' : ''}`}
>>>>>>> master
      style={cardStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={hoverable ? { y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;