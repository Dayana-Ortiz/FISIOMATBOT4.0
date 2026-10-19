import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaArrowRight } from 'react-icons/fa';
import { FaTrophy, FaThumbsUp, FaBookOpen, FaCircleCheck, FaXmark } from 'react-icons/fa6';
import { ModuleType } from '../../types';
import { ApiError } from '../../services/api';
import * as quizService from '../../services/quizService';
import type { AnswerResult, StudentQuestion } from '../../services/quizService';
import Button from '../common/Button.tsx';
import './ModuleStyles.css';

interface QuizComponentProps {
  module: ModuleType;
  onClose: () => void;
  /** Se llama al terminar el quiz (para registrar la actividad en el progreso). */
  onComplete?: (score: number, total: number) => void;
}

const MODULE_NAMES: Record<ModuleType, string> = {
  physics: 'Ciencia',
  mathematics: 'Matemáticas',
  technology: 'Tecnología',
  simulator: 'Simulador',
};

interface Answer {
  optionId: number;
  result: AnswerResult;
}

/**
 * Quiz del módulo. Las preguntas las crean los profesores en "Gestionar quizzes" y llegan sin la
 * respuesta correcta: cada respuesta se envía al servidor, que la corrige y guarda el intento.
 */
const QuizComponent: React.FC<QuizComponentProps> = ({ module, onClose, onComplete }) => {
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [sending, setSending] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let cancelled = false;
    quizService
      .getModuleQuiz(module)
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el quiz.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [module]);

  const currentQuiz = questions[currentQuestion];
  const currentAnswer = currentQuiz ? answers[currentQuiz.id] : undefined;
  const score = Object.values(answers).filter((a) => a.result.isCorrect).length;

  const handleAnswerSelect = async (optionId: number) => {
    if (!currentQuiz || currentAnswer || sending) return;
    setSending(true);
    setAnswerError('');
    try {
      const result = await quizService.answerQuestion(currentQuiz.id, optionId);
      setAnswers((prev) => ({ ...prev, [currentQuiz.id]: { optionId, result } }));
    } catch (err) {
      setAnswerError(err instanceof ApiError ? err.message : 'No se pudo enviar tu respuesta. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setAnswerError('');
    } else {
      setShowResults(true);
      onComplete?.(score, questions.length);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setAnswerError('');
    setShowResults(false);
  };

  const optionClass = (optionId: number) => {
    if (!currentAnswer) return '';
    if (optionId === currentAnswer.result.correctOptionId) return 'correct';
    if (optionId === currentAnswer.optionId) return 'incorrect';
    return 'dimmed';
  };

  if (loading || loadError || questions.length === 0) {
    return (
      <div className="quiz-modal-overlay">
        <div className="quiz-modal">
          <button className="close-btn" onClick={onClose} aria-label="Cerrar quiz">
            <FaTimes />
          </button>
          <h3>
            {loading
              ? 'Cargando el quiz…'
              : loadError || 'Todavía no hay preguntas para este módulo'}
          </h3>
          {!loading && !loadError && (
            <p className="text-muted">Tu profesor aún no ha publicado preguntas aquí. Vuelve más tarde.</p>
          )}
          {!loading && (
            <Button variant="primary" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <button className="close-btn" onClick={onClose} aria-label="Cerrar quiz">
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
                <h3>Quiz de {MODULE_NAMES[module]}</h3>
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
                      key={option.id}
                      className={`option-btn ${optionClass(option.id)}`}
                      onClick={() => void handleAnswerSelect(option.id)}
                      disabled={Boolean(currentAnswer) || sending}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option.text}
                      {currentAnswer && option.id === currentAnswer.result.correctOptionId && (
                        <FaCheck className="correct-icon" aria-label="Respuesta correcta" />
                      )}
                      {currentAnswer && option.id === currentAnswer.optionId && !currentAnswer.result.isCorrect && (
                        <FaXmark className="incorrect-icon" aria-label="Tu respuesta" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {answerError && <p className="quiz-error" role="alert">{answerError}</p>}

              {currentAnswer && (
                <div className={`explanation-box ${currentAnswer.result.isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                  <p>
                    <strong>{currentAnswer.result.isCorrect ? '¡Correcto!' : 'No es correcto.'}</strong>
                    {currentAnswer.result.explanation && <> {currentAnswer.result.explanation}</>}
                  </p>
                </div>
              )}

              <div className="quiz-navigation">
                <div className="score-display">
                  Puntuación: {score} / {questions.length}
                </div>

                <button
                  className="nav-btn primary"
                  onClick={handleNextQuestion}
                  disabled={!currentAnswer}
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
