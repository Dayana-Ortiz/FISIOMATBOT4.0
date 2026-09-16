import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { FaTrophy, FaThumbsUp, FaBookOpen, FaCircleCheck } from 'react-icons/fa6';
import { ModuleType } from '../../types';
import Button from '../common/Button.tsx';
import './ModuleStyles.css';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  module: ModuleType;
  onClose: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ module, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);

  const quizData: Record<ModuleType, QuizQuestion[]> = {
    physics: [
      {
        id: 1,
        question: '¿Qué representa la fórmula F = m × a?',
        options: [
          'Ley de Gravitación Universal',
          'Segunda Ley de Newton',
          'Principio de Arquímedes',
          'Ley de Ohm'
        ],
        correctAnswer: 1,
        explanation: 'F = m × a es la Segunda Ley de Newton, que establece que la fuerza neta aplicada sobre un cuerpo es proporcional a la aceleración que adquiere.'
      },
      {
        id: 2,
        question: '¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional?',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'],
        correctAnswer: 1,
        explanation: 'La unidad de fuerza en el SI es el Newton (N), llamado así en honor a Isaac Newton.'
      }
    ],
    mathematics: [
      {
        id: 1,
        question: '¿Cuál es el resultado de (x + 2)(x - 2)?',
        options: ['x² - 4', 'x² + 4', 'x² - 2x + 4', 'x² + 2x - 4'],
        correctAnswer: 0,
        explanation: 'Aplicando la diferencia de cuadrados: (x + 2)(x - 2) = x² - 4'
      }
    ],
    technology: [
      {
        id: 1,
        question: '¿Qué lenguaje se usa principalmente para desarrollo web frontend?',
        options: ['Python', 'Java', 'JavaScript', 'C++'],
        correctAnswer: 2,
        explanation: 'JavaScript es el lenguaje principal para desarrollo web frontend, aunque también se usa en backend con Node.js.'
      }
    ],
    simulator: [
      {
        id: 1,
        question: '¿Qué parámetro afecta más el alcance en un lanzamiento parabólico?',
        options: ['Masa del objeto', 'Ángulo de lanzamiento', 'Color del objeto', 'Temperatura'],
        correctAnswer: 1,
        explanation: 'El ángulo de lanzamiento es crítico para determinar el alcance en movimiento parabólico.'
      }
    ]
  };

  const questions = quizData[module] || [];
  const currentQuiz = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === currentQuiz.correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h3>No hay preguntas disponibles para este módulo</h3>
          <Button variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="quiz-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="quiz-header">
                <h3>Quiz de {module.charAt(0).toUpperCase() + module.slice(1)}</h3>
                <div className="quiz-progress">
                  <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${((currentQuestion + 1) / questions.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="quiz-question">
                <h4>{currentQuiz.question}</h4>
                <div className="quiz-options">
                  {currentQuiz.options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                      {selectedAnswer === index && selectedAnswer === currentQuiz.correctAnswer && (
                        <FaCheck className="correct-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedAnswer !== null && (
                <div className="explanation-box">
                  <p><strong>Explicación:</strong> {currentQuiz.explanation}</p>
                </div>
              )}
              
              <div className="quiz-navigation">
                <button
                  className="nav-btn"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  <FaArrowLeft /> Anterior
                </button>
                
                <div className="score-display">
                  Puntuación: {score} / {questions.length}
                </div>
                
                <button
                  className="nav-btn primary"
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                >
                  {currentQuestion < questions.length - 1 ? 'Siguiente' : 'Ver Resultados'} 
                  <FaArrowRight />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="icon-inline"><FaCircleCheck /> ¡Quiz Completado!</h3>
              
              <div className="score-circle">
                <div className="circle-content">
                  <span className="score-percentage">
                    {Math.round((score / questions.length) * 100)}%
                  </span>
                  <span className="score-text">
                    {score} / {questions.length}
                  </span>
                </div>
              </div>
              
              <div className="result-message">
                {score === questions.length ? (
                  <p className="icon-inline"><FaTrophy /> ¡Excelente! Dominas completamente este tema.</p>
                ) : score >= questions.length / 2 ? (
                  <p className="icon-inline"><FaThumbsUp /> ¡Buen trabajo! Tienes un buen entendimiento del tema.</p>
                ) : (
                  <p className="icon-inline"><FaBookOpen /> Sigue practicando. Revisa las lecciones e inténtalo de nuevo.</p>
                )}
              </div>
              
              <div className="result-actions">
                <Button variant="outline" onClick={handleRestartQuiz}>
                  Repetir Quiz
                </Button>
                <Button variant="primary" onClick={onClose}>
                  Continuar Aprendiendo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizComponent;
