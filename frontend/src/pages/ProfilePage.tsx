import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Estudiante',
    email: 'estudiante@ejemplo.com',
    grade: 'Grado 10',
    school: 'Instituto Educativo',
    avatar: '👤',
    bio: 'Estudiante apasionado por la ciencia y las matemáticas.',
    joinDate: 'Enero 2024',
    completedLessons: 45,
    totalScore: 8750,
    achievements: 12
  });

  const [editData, setEditData] = useState(userData);

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  return (
    <section aria-labelledby="profile-page-title">
      <header className="mb-4">
        <h1 id="profile-page-title">👤 Mi Perfil</h1>
        <p className="text-muted">
          Gestiona tu información personal y revisa tus estadísticas de aprendizaje.
        </p>
      </header>

      <div className="row g-4">
        {/* Información del Perfil */}
        <article className="col-12 col-lg-8">
          <Card className="profile-card">
            <div className="profile-header">
              <div className="avatar-section">
                <div className="avatar">
                  {userData.avatar}
                </div>
                <div className="user-basic-info">
                  <h2 className="user-name">{userData.name}</h2>
                  <p className="user-grade">{userData.grade}</p>
                  <p className="user-email">{userData.email}</p>
                </div>
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    icon="✏️"
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="edit-actions">
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-content">
              {!isEditing ? (
                <div className="profile-info">
                  <div className="info-section">
                    <h3>Información Personal</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Nombre:</label>
                        <span>{userData.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Email:</label>
                        <span>{userData.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Grado:</label>
                        <span>{userData.grade}</span>
                      </div>
                      <div className="info-item">
                        <label>Institución:</label>
                        <span>{userData.school}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>Biografía</h3>
                    <p className="bio-text">{userData.bio}</p>
                  </div>

                  <div className="info-section">
                    <h3>Información de Cuenta</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Miembro desde:</label>
                        <span>{userData.joinDate}</span>
                      </div>
                      <div className="info-item">
                        <label>Estado:</label>
                        <span className="status-active">Activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-edit">
                  <div className="edit-section">
                    <h3>Editar Información</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="edit-name">Nombre:</label>
                        <Input
                          id="edit-name"
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-email">Email:</label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-grade">Grado:</label>
                        <Input
                          id="edit-grade"
                          type="text"
                          value={editData.grade}
                          onChange={(e) => setEditData({...editData, grade: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-school">Institución:</label>
                        <Input
                          id="edit-school"
                          type="text"
                          value={editData.school}
                          onChange={(e) => setEditData({...editData, school: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="edit-bio">Biografía:</label>
                      <textarea
                        id="edit-bio"
                        className="bio-textarea"
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        rows={3}
                        placeholder="Cuéntanos un poco sobre ti..."
                      />
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
            <h3 className="card-title">📊 Estadísticas</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{userData.completedLessons}</div>
                <div className="stat-label">Lecciones Completadas</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{userData.totalScore.toLocaleString()}</div>
                <div className="stat-label">Puntos Totales</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{userData.achievements}</div>
                <div className="stat-label">Logros</div>
              </div>
            </div>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="actions-card">
            <h3 className="card-title">⚡ Acciones Rápidas</h3>
            <div className="actions-list">
              <Button variant="outline" fullWidth className="action-btn">
                🔒 Cambiar Contraseña
              </Button>
              <Button variant="outline" fullWidth className="action-btn">
                🔔 Preferencias de Notificaciones
              </Button>
              <Button variant="outline" fullWidth className="action-btn">
                🎨 Tema de la Interfaz
              </Button>
              <Button variant="outline" fullWidth className="action-btn">
                📱 Descargar Datos
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default ProfilePage;