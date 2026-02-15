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
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  onClick,
  color,
  style
}) => {
  const cardStyle: CSSProperties = {
    ...style,
    ...(color ? { borderTop: `4px solid ${color}` } : {})
  };

  return (
    <motion.div
      className={`card ${className} ${hoverable ? 'hoverable' : ''}`}
      style={cardStyle}
      onClick={onClick}
      whileHover={hoverable ? { y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;