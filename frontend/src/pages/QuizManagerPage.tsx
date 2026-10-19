import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowUp,
  FaCircleCheck,
  FaCircleQuestion,
  FaEye,
  FaEyeSlash,
  FaPen,
  FaPlus,
  FaTrash,
  FaXmark,
} from 'react-icons/fa6';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotifications } from '../context/NotificationContext';
import { moduleIcons } from '../Utils/moduleIcons';
import { ApiError } from '../services/api';
import * as quizService from '../services/quizService';
import type { Difficulty, ManagedQuiz, QuizInput } from '../services/quizService';
import { DIFFICULTY_LABELS } from '../services/quizService';
import { ModuleType } from '../types';
import './QuizManagerPage.css';

const MODULES: { code: ModuleType; name: string }[] = [
  { code: 'physics', name: 'Ciencia' },
  { code: 'mathematics', name: 'Matemáticas' },
  { code: 'technology', name: 'Tecnología' },
  { code: 'simulator', name: 'Simulador' },
];

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const emptyQuiz = (): QuizInput => ({
  question: '',
  explanation: '',
  difficulty: 'medium',
  isActive: true,
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

const toInput = (q: ManagedQuiz): QuizInput => ({
  question: q.question,
  explanation: q.explanation ?? '',
  difficulty: q.difficulty,
  isActive: q.isActive,
  options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
});

/** Validación en el navegador (el backend valida lo mismo). Devuelve el mensaje de error o ''. */
const validate = (data: QuizInput): string => {
  if (data.question.trim().length < 5) return 'Escribe la pregunta (mínimo 5 caracteres).';
  const filled = data.options.filter((o) => o.text.trim());
  if (filled.length !== data.options.length) return 'Completa el texto de todas las opciones o elimina las vacías.';
  if (data.options.length < MIN_OPTIONS) return `Agrega al menos ${MIN_OPTIONS} opciones.`;
  const texts = data.options.map((o) => o.text.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) return 'Hay opciones repetidas.';
  if (data.options.filter((o) => o.isCorrect).length !== 1) return 'Marca cuál es la respuesta correcta.';
  return '';
};

const QuizManagerPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramModule = searchParams.get('module') as ModuleType | null;
  const module: ModuleType = MODULES.some((m) => m.code === paramModule) ? (paramModule as ModuleType) : 'physics';

  const [quizzes, setQuizzes] = useState<ManagedQuiz[]>([]);
  const [summary, setSummary] = useState<Record<string, { total: number; active: number }>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Editor: null = cerrado; editingId null = pregunta nueva
  const [form, setForm] = useState<QuizInput | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<ManagedQuiz | null>(null);

  const reload = useCallback(async () => {
    setLoadError('');
    try {
      const [list, counts] = await Promise.all([quizService.listQuizzes(module), quizService.getQuizSummary()]);
      setQuizzes(list);
      setSummary(Object.fromEntries(counts.map((c) => [c.code, { total: c.total, active: c.active }])));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    setLoading(true);
    setForm(null);
    void reload();
  }, [reload]);

  const notifyError = (err: unknown, title: string) =>
    addNotification({
      title,
      message: err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.',
      kind: 'warning',
    });

  // --- Editor ---

  const openNew = () => {
    setEditingId(null);
    setForm(emptyQuiz());
    setFormError('');
  };

  const openEdit = (quiz: ManagedQuiz) => {
    setEditingId(quiz.id);
    setForm(toInput(quiz));
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
    setFormError('');
  };

  const updateOption = (index: number, text: string) =>
    setForm((f) => f && { ...f, options: f.options.map((o, i) => (i === index ? { ...o, text } : o)) });

  const markCorrect = (index: number) =>
    setForm((f) => f && { ...f, options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })) });

  const addOption = () =>
    setForm((f) => f && f.options.length < MAX_OPTIONS ? { ...f, options: [...f.options, { text: '', isCorrect: false }] } : f);

  const removeOption = (index: number) =>
    setForm((f) => {
      if (!f || f.options.length <= MIN_OPTIONS) return f;
      const options = f.options.filter((_, i) => i !== index);
      // Si se borró la correcta, la primera pasa a ser la correcta para no dejar la pregunta sin respuesta
      if (!options.some((o) => o.isCorrect)) options[0] = { ...options[0], isCorrect: true };
      return { ...f, options };
    });

  const handleSave = async () => {
    if (!form) return;
    const data: QuizInput = {
      ...form,
      question: form.question.trim(),
      explanation: form.explanation.trim(),
      options: form.options.map((o) => ({ ...o, text: o.text.trim() })),
    };
    const error = validate(data);
    if (error) {
      setFormError(error);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await quizService.updateQuiz(editingId, data);
      } else {
        await quizService.createQuiz(module, data);
      }
      addNotification({
        title: editingId ? 'Pregunta actualizada' : 'Pregunta creada',
        message: data.isActive ? 'Los estudiantes ya la ven en el quiz.' : 'Quedó oculta para los estudiantes.',
        kind: 'success',
      });
      closeForm();
      await reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  // --- Acciones de la lista ---

  const toggleActive = async (quiz: ManagedQuiz) => {
    setBusyId(quiz.id);
    try {
      await quizService.setQuizStatus(quiz.id, !quiz.isActive);
      await reload();
    } catch (err) {
      notifyError(err, 'No se pudo cambiar la visibilidad');
    } finally {
      setBusyId(null);
    }
  };

  const move = async (quiz: ManagedQuiz, direction: 'up' | 'down') => {
    setBusyId(quiz.id);
    try {
      await quizService.moveQuiz(quiz.id, direction);
      await reload();
    } catch (err) {
      notifyError(err, 'No se pudo cambiar el orden');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const quiz = toDelete;
    setBusyId(quiz.id);
    try {
      await quizService.deleteQuiz(quiz.id);
      if (editingId === quiz.id) closeForm();
      addNotification({ title: 'Pregunta eliminada', message: quiz.question, kind: 'info' });
      await reload();
    } catch (err) {
      notifyError(err, 'No se pudo eliminar');
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  const moduleName = MODULES.find((m) => m.code === module)?.name ?? '';

  return (
    <section aria-labelledby="quiz-manager-title">
      <header className="mb-4">
        <Link to="/admin" className="quiz-manager-back icon-inline">
          <FaArrowLeft /> Panel de administración
        </Link>
        <h1 id="quiz-manager-title" className="icon-inline"><FaCircleQuestion /> Gestionar quizzes</h1>
        <p className="text-muted">
          Crea, edita y ordena las preguntas que verán tus estudiantes en el quiz de cada módulo.
          Las respuestas correctas nunca se envían al navegador del estudiante: se corrigen en el servidor.
        </p>
      </header>

      <nav className="quiz-manager-tabs" aria-label="Módulos">
        {MODULES.map((m) => (
          <button
            key={m.code}
            type="button"
            className={`quiz-manager-tab ${module === m.code ? 'active' : ''}`}
            aria-pressed={module === m.code}
            onClick={() => setSearchParams({ module: m.code })}
          >
            <span className="quiz-manager-tab-icon">{moduleIcons[m.code]}</span>
            {m.name}
            {summary[m.code] && <span className="quiz-manager-tab-count">{summary[m.code].active}</span>}
          </button>
        ))}
      </nav>

      {form ? (
        <Card className="quiz-editor mb-4" hoverable={false}>
          <h2 className="h5 mb-3">
            {editingId ? 'Editar pregunta' : `Nueva pregunta para ${moduleName}`}
          </h2>

          {formError && <p className="quiz-manager-error" role="alert">{formError}</p>}

          <label htmlFor="quiz-question" className="quiz-editor-label">Pregunta</label>
          <textarea
            id="quiz-question"
            className="quiz-editor-textarea"
            rows={3}
            maxLength={1000}
            value={form.question}
            disabled={saving}
            placeholder="Ej.: ¿Cuál es la energía potencial de una caja de 2 kg a 3 m de altura?"
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />

          <fieldset className="quiz-editor-options" disabled={saving}>
            <legend className="quiz-editor-label">
              Opciones <span className="text-muted">(marca la respuesta correcta)</span>
            </legend>
            {form.options.map((option, index) => (
              <div key={index} className={`quiz-editor-option ${option.isCorrect ? 'is-correct' : ''}`}>
                <input
                  type="radio"
                  name="quiz-correct"
                  checked={option.isCorrect}
                  onChange={() => markCorrect(index)}
                  aria-label={`Opción ${String.fromCharCode(65 + index)} es la correcta`}
                />
                <span className="quiz-editor-letter">{String.fromCharCode(65 + index)}</span>
                <input
                  type="text"
                  className="quiz-editor-input"
                  maxLength={500}
                  value={option.text}
                  placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                  onChange={(e) => updateOption(index, e.target.value)}
                  aria-label={`Texto de la opción ${String.fromCharCode(65 + index)}`}
                />
                <button
                  type="button"
                  className="quiz-icon-btn"
                  onClick={() => removeOption(index)}
                  disabled={form.options.length <= MIN_OPTIONS}
                  title="Eliminar opción"
                  aria-label={`Eliminar opción ${String.fromCharCode(65 + index)}`}
                >
                  <FaXmark />
                </button>
              </div>
            ))}
            {form.options.length < MAX_OPTIONS && (
              <button type="button" className="quiz-add-option icon-inline" onClick={addOption}>
                <FaPlus /> Agregar opción
              </button>
            )}
          </fieldset>

          <label htmlFor="quiz-explanation" className="quiz-editor-label">
            Explicación <span className="text-muted">(opcional; el estudiante la ve después de responder)</span>
          </label>
          <textarea
            id="quiz-explanation"
            className="quiz-editor-textarea"
            rows={2}
            maxLength={1000}
            value={form.explanation}
            disabled={saving}
            placeholder="Explica por qué esa es la respuesta correcta."
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          />

          <div className="quiz-editor-row">
            <label className="quiz-editor-inline">
              Dificultad
              <select
                className="quiz-editor-select"
                value={form.difficulty}
                disabled={saving}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              >
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                ))}
              </select>
            </label>
            <label className="quiz-editor-inline">
              <input
                type="checkbox"
                checked={form.isActive}
                disabled={saving}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Visible para los estudiantes
            </label>
          </div>

          <div className="quiz-editor-actions">
            <Button variant="secondary" onClick={closeForm} disabled={saving}>Cancelar</Button>
            <Button variant="primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear pregunta'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="quiz-manager-toolbar mb-3">
          <span className="text-muted">
            {summary[module]
              ? `${summary[module].total} preguntas en ${moduleName} · ${summary[module].active} visibles para los estudiantes`
              : ''}
          </span>
          <Button variant="primary" icon={<FaPlus />} onClick={openNew}>Nueva pregunta</Button>
        </div>
      )}

      {loading && <p className="text-muted">Cargando preguntas…</p>}
      {loadError && <p className="quiz-manager-error" role="alert">{loadError}</p>}

      {!loading && !loadError && quizzes.length === 0 && (
        <Card hoverable={false}>
          <p className="mb-0">
            Todavía no hay preguntas en {moduleName}. Crea la primera con <strong>Nueva pregunta</strong>.
          </p>
        </Card>
      )}

      <ol className="quiz-manager-list list-unstyled">
        {quizzes.map((quiz, index) => (
          <li key={quiz.id}>
            <Card className={`quiz-item ${quiz.isActive ? '' : 'is-hidden'}`} hoverable={false}>
              <div className="quiz-item-header">
                <span className="quiz-item-number">{index + 1}</span>
                <h3 className="quiz-item-question">{quiz.question}</h3>
              </div>

              <div className="quiz-item-badges">
                <span className={`quiz-badge difficulty-${quiz.difficulty}`}>{DIFFICULTY_LABELS[quiz.difficulty]}</span>
                {!quiz.isActive && <span className="quiz-badge hidden-badge"><FaEyeSlash /> Oculta</span>}
                {quiz.authorName && <span className="quiz-item-author">Creada por {quiz.authorName}</span>}
              </div>

              <ul className="quiz-item-options list-unstyled">
                {quiz.options.map((option, i) => (
                  <li key={option.id ?? i} className={option.isCorrect ? 'correct' : ''}>
                    <span className="quiz-editor-letter">{String.fromCharCode(65 + i)}</span>
                    {option.text}
                    {option.isCorrect && <FaCircleCheck className="quiz-item-check" aria-label="Respuesta correcta" />}
                  </li>
                ))}
              </ul>

              {quiz.explanation && <p className="quiz-item-explanation"><strong>Explicación:</strong> {quiz.explanation}</p>}

              <div className="quiz-item-actions">
                <Button variant="outline" size="small" icon={<FaPen />} onClick={() => openEdit(quiz)} disabled={busyId === quiz.id}>
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  icon={quiz.isActive ? <FaEyeSlash /> : <FaEye />}
                  onClick={() => void toggleActive(quiz)}
                  disabled={busyId === quiz.id}
                >
                  {quiz.isActive ? 'Ocultar' : 'Mostrar'}
                </Button>
                <button
                  type="button"
                  className="quiz-icon-btn"
                  onClick={() => void move(quiz, 'up')}
                  disabled={index === 0 || busyId === quiz.id}
                  title="Subir"
                  aria-label="Subir pregunta"
                >
                  <FaArrowUp />
                </button>
                <button
                  type="button"
                  className="quiz-icon-btn"
                  onClick={() => void move(quiz, 'down')}
                  disabled={index === quizzes.length - 1 || busyId === quiz.id}
                  title="Bajar"
                  aria-label="Bajar pregunta"
                >
                  <FaArrowDown />
                </button>
                <Button
                  variant="danger"
                  size="small"
                  icon={<FaTrash />}
                  onClick={() => setToDelete(quiz)}
                  disabled={busyId === quiz.id}
                  className="quiz-item-delete"
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <Modal isOpen={toDelete !== null} onClose={() => setToDelete(null)} title="¿Eliminar esta pregunta?">
        <p>{toDelete?.question}</p>
        <p className="text-muted">
          Se borrarán también las respuestas que dieron los estudiantes a esta pregunta. Si solo quieres
          retirarla por un tiempo, usa <strong>Ocultar</strong>.
        </p>
        <div className="quiz-editor-actions">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancelar</Button>
          <Button variant="danger" icon={<FaTrash />} onClick={() => void confirmDelete()} disabled={busyId !== null}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  );
};

export default QuizManagerPage;
