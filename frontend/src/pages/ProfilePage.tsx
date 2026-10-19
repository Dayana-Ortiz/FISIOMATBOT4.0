import React, { useEffect, useState } from 'react';
import { FaUser, FaPen, FaChartColumn, FaBolt, FaLock, FaBell, FaPalette, FaDownload } from 'react-icons/fa6';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import { ApiError } from '../services/api';
import * as profileService from '../services/profileService';
import type { Profile, ProfileStats, ProfileUpdate } from '../services/profileService';
import { Grade } from '../types';
import './ProfilePage.css';

const MAX_BIO = 500;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_LABELS: Record<Profile['role'], string> = {
  student: 'Estudiante',
  teacher: 'Docente',
  admin: 'Administrador',
};

const toEditData = (p: Profile): ProfileUpdate => ({
  name: p.name,
  email: p.email,
  grade: p.grade ?? null,
  institution: p.institution ?? '',
  bio: p.bio ?? '',
});

// created_at llega como "YYYY-MM-DD HH:MM:SS" (dateStrings en mysql2)
const formatJoinDate = (value: string): string => {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '—';
  const text = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const ProfilePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { login } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileUpdate | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let cancelled = false;
    profileService
      .getMyProfile()
      .then((res) => {
        if (cancelled) return;
        setProfile(res.profile);
        setStats(res.stats);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isStudent = profile?.role === 'student';

  const startEditing = () => {
    if (!profile) return;
    setEditData(toEditData(profile));
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!editData) return;
    const data = { ...editData, name: editData.name.trim(), email: editData.email.trim() };

    if (!data.name) {
      setSaveError('El nombre es obligatorio.');
      return;
    }
    if (!EMAIL_REGEX.test(data.email)) {
      setSaveError('Por favor ingresa un email válido.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const res = await profileService.updateMyProfile(data);
      setProfile(res.profile);
      setStats(res.stats);
      setIsEditing(false);
      // Actualiza el nombre que se muestra en la barra superior
      login({
        id: res.profile.id,
        name: res.profile.name,
        email: res.profile.email,
        role: res.profile.role,
        grade: res.profile.grade,
        institution: res.profile.institution,
        avatar: res.profile.avatar,
      });
      addNotification({
        title: 'Perfil actualizado',
        message: 'Tu información personal se guardó correctamente.',
        kind: 'success',
      });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <header className="mb-4">
      <h1 id="profile-page-title" className="icon-inline"><FaUser /> Mi Perfil</h1>
      <p className="text-muted">
        Gestiona tu información personal y revisa tus estadísticas de aprendizaje.
      </p>
    </header>
  );

  if (loading || !profile || !stats) {
    return (
      <section aria-labelledby="profile-page-title">
        {header}
        <Card className="profile-card">
          <p className={loadError ? 'profile-error' : 'text-muted'} role={loadError ? 'alert' : undefined}>
            {loadError || 'Cargando tu perfil…'}
          </p>
        </Card>
      </section>
    );
  }

  const gradeLabel = isStudent
    ? profile.grade ? `Grado ${profile.grade}` : 'Grado sin especificar'
    : ROLE_LABELS[profile.role];

  return (
    <section aria-labelledby="profile-page-title">
      {header}

      <div className="row g-4">
        {/* Información del Perfil */}
        <article className="col-12 col-lg-8">
          <Card className="profile-card">
            <div className="profile-header">
              <div className="avatar-section">
                <div className="avatar">
                  <FaUser />
                </div>
                <div className="user-basic-info">
                  <h2 className="user-name">{profile.name}</h2>
                  <p className="user-grade">{gradeLabel}</p>
                  <p className="user-email">{profile.email}</p>
                </div>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <Button variant="outline" onClick={startEditing} icon={<FaPen />}>
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="edit-actions">
                    <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Guardando…' : 'Guardar Cambios'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-content">
              {!isEditing || !editData ? (
                <div className="profile-info">
                  <div className="info-section">
                    <h3>Información Personal</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Nombre:</label>
                        <span>{profile.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Email:</label>
                        <span>{profile.email}</span>
                      </div>
                      <div className="info-item">
                        <label>{isStudent ? 'Grado:' : 'Rol:'}</label>
                        <span>{gradeLabel}</span>
                      </div>
                      <div className="info-item">
                        <label>Institución:</label>
                        <span>{profile.institution || 'Sin especificar'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>Biografía</h3>
                    <p className="bio-text">
                      {profile.bio || 'Aún no has escrito tu biografía. Usa "Editar Perfil" para agregarla.'}
                    </p>
                  </div>

                  <div className="info-section">
                    <h3>Información de Cuenta</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Miembro desde:</label>
                        <span>{formatJoinDate(profile.createdAt)}</span>
                      </div>
                      <div className="info-item">
                        <label>Estado:</label>
                        <span className={profile.status === 'active' ? 'status-active' : ''}>
                          {profile.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-edit">
                  <div className="edit-section">
                    <h3>Editar Información</h3>
                    {saveError && (
                      <p className="profile-error" role="alert">{saveError}</p>
                    )}
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="edit-name">Nombre:</label>
                        <Input
                          id="edit-name"
                          type="text"
                          value={editData.name}
                          maxLength={120}
                          disabled={saving}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-email">Email:</label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editData.email}
                          maxLength={150}
                          disabled={saving}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                      </div>
                      {isStudent && (
                        <div className="form-group">
                          <label htmlFor="edit-grade">Grado:</label>
                          <select
                            id="edit-grade"
                            className="input"
                            value={editData.grade ?? ''}
                            disabled={saving}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                grade: e.target.value ? (Number(e.target.value) as Grade) : null,
                              })
                            }
                          >
                            <option value="">Sin especificar</option>
                            <option value="9">Grado 9</option>
                            <option value="10">Grado 10</option>
                            <option value="11">Grado 11</option>
                          </select>
                        </div>
                      )}
                      <div className="form-group">
                        <label htmlFor="edit-school">Institución:</label>
                        <Input
                          id="edit-school"
                          type="text"
                          value={editData.institution}
                          maxLength={150}
                          disabled={saving}
                          placeholder="Nombre de tu institución"
                          onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="edit-bio">Biografía:</label>
                      <textarea
                        id="edit-bio"
                        className="bio-textarea"
                        value={editData.bio}
                        maxLength={MAX_BIO}
                        disabled={saving}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        rows={3}
                        placeholder="Cuéntanos un poco sobre ti..."
                      />
                      <small className="text-muted">{editData.bio.length}/{MAX_BIO}</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </article>

        {/* Panel Lateral */}
        <aside className="col-12 col-lg-4" aria-label="Panel lateral de estadísticas y acciones">
          {/* Estadísticas */}
          <Card className="stats-card mb-4">
            <h3 className="card-title icon-inline"><FaChartColumn /> Estadísticas</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.completedLessons}</div>
                <div className="stat-label">Actividades Completadas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalScore.toLocaleString('es-CO')}</div>
                <div className="stat-label">Puntos Totales</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.achievements}</div>
                <div className="stat-label">Logros</div>
              </div>
            </div>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="actions-card">
            <h3 className="card-title icon-inline"><FaBolt /> Acciones Rápidas</h3>
            <div className="actions-list">
              <Button variant="outline" fullWidth className="action-btn" icon={<FaLock />}>
                Cambiar Contraseña
              </Button>
              <Button variant="outline" fullWidth className="action-btn" icon={<FaBell />}>
                Preferencias de Notificaciones
              </Button>
              <Button variant="outline" fullWidth className="action-btn" icon={<FaPalette />}>
                Tema de la Interfaz
              </Button>
              <Button variant="outline" fullWidth className="action-btn" icon={<FaDownload />}>
                Descargar Datos
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default ProfilePage;
