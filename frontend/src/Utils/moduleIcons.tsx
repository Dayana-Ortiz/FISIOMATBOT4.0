import React from 'react';
import { FaAtom, FaCalculator, FaLaptopCode, FaGamepad } from 'react-icons/fa6';
import { ModuleType } from '../types';

export const moduleIcons: Record<ModuleType, React.ReactNode> = {
  physics: <FaAtom />,
  mathematics: <FaCalculator />,
  technology: <FaLaptopCode />,
  simulator: <FaGamepad />,
};
