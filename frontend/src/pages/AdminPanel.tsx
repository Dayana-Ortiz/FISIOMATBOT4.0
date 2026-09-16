import React, { useMemo, useState } from 'react';
import {
  FaGear,
  FaUsers,
  FaBookOpen,
  FaBolt,
  FaUserPlus,
  FaChartBar,
  FaSchool,
  FaGraduationCap,
  FaChalkboardUser,
  FaShieldHalved,
  FaCircleCheck,
} from 'react-icons/fa6';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { moduleIcons } from '../Utils/moduleIcons';
import { UserRole } from '../types';
import './AdminPanel.css';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade?: number;
  status: 'active' | 'inactive';
}

// TODO: reemplazar por datos reales cuando exista el backend (endpoint de administración de usuarios).
const initialUsers: ManagedUser[] = [
  { id: '1', name: 'María López', email: 'maria.lopez@fisiomatbot.com', role: 'student', grade: 9, status: 'active' },
  { id: '2', name: 'Juan Pérez', email: 'juan.perez@fisiomatbot.com', role: 'student', grade: 10, status: 'active' },
  { id: '3', name: 'Camila Ríos', email: 'camila.rios@fisiomatbot.com', role: 'student', grade: 11, status: 'inactive' },
  { id: '4', name: 'Carlos Gómez', email: 'profesor@fisiomatbot.com', role: 'teacher', status: 'active' },
  { id: '5', name: 'Ana Torres', email: 'ana.torres@fisiomatbot.com', role: 'teacher', status: 'active' },
  { id: '6', name: 'Administrador Demo', email: 'admin@fisiomatbot.com', role: 'admin', status: 'active' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Estudiante',
  teacher: 'Profesor',
  admin: 'Administrador',
};

const MODULES = [
  { icon: moduleIcons.physics, name: 'Ciencia', lessons: 12, students: 84 },
  { icon: moduleIcons.mathematics, name: 'Matemáticas', lessons: 18, students: 96 },
  { icon: moduleIcons.technology, name: 'Tecnología', lessons: 9, students: 61 },
  { icon: moduleIcons.simulator, name: 'Simulador', lessons: 7, students: 73 },
];

const AdminPanel: React.FC = () => {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(
    () => ({
      students: users.filter((u) => u.role === 'student').length,
      teachers: users.filter((u) => u.role === 'teacher').length,
      admins: users.filter((u) => u.role === 'admin').length,
      active: users.filter((u) => u.status === 'active').length,
    }),
    [users]
  );

  const toggleStatus = (id: string) => {
    const target = users.find((u) => u.id === id);
    const nextStatus = target?.status === 'active' ? 'inactive' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );
    if (target) {
      addNotification({
        title: nextStatus === 'active' ? 'Cuenta activada' : 'Cuenta desactivada',
        message: `${target.name} fue ${nextStatus === 'active' ? 'activado' : 'desactivado'}.`,
        kind: nextStatus === 'active' ? 'success' : 'warning',
      });
    }
  };

  const changeRole = (id: string, role: UserRole) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    if (target && target.role !== role) {
      addNotification({
        title: 'Rol actualizado',
        message: `${target.name} ahora es ${ROLE_LABELS[role]}.`,
        kind: 'info',
      });
    }
  };

  return (
    <section aria-labelledby="admin-page-title">
      <header className="mb-4">
        <h1 id="admin-page-title" className="icon-inline"><FaGear /> Panel de administración</h1>
        <p className="text-muted">
          {user?.role === 'admin'
            ? 'Gestiona usuarios, roles y contenidos de la plataforma.'
            : 'Gestiona tus estudiantes y el contenido de tus módulos.'}
        </p>
      </header>

      {/* Resumen general */}
      <section className="admin-stats-grid mb-4" aria-label="Resumen general de la plataforma">
        <Card className="admin-stat-card">
          <div className="admin-stat-icon"><FaGraduationCap /></div>
          <div>
            <div className="admin-stat-number">{stats.students}</div>
            <div className="admin-stat-label">Estudiantes</div>
          </div>
        </Card>
        <Card className="admin-stat-card">
          <div className="admin-stat-icon"><FaChalkboardUser /></div>
          <div>
            <div className="admin-stat-number">{stats.teachers}</div>
            <div className="admin-stat-label">Profesores</div>
          </div>
        </Card>
        <Card className="admin-stat-card">
          <div className="admin-stat-icon"><FaShieldHalved /></div>
          <div>
            <div className="admin-stat-number">{stats.admins}</div>
            <div className="admin-stat-label">Administradores</div>
          </div>
        </Card>
        <Card className="admin-stat-card">
          <div className="admin-stat-icon"><FaCircleCheck /></div>
          <div>
            <div className="admin-stat-number">{stats.active}</div>
            <div className="admin-stat-label">Cuentas activas</div>
          </div>
        </Card>
      </section>

      <div className="row g-4">
        {/* Gestión de usuarios */}
        <article className="col-12 col-lg-8">
          <Card className="admin-users-card" noPadding>
            <div className="admin-users-header">
              <h2 className="card-title icon-inline"><FaUsers /> Usuarios de la plataforma</h2>
              <div className="admin-users-filters">
                <Input
                  type="search"
                  placeholder="Buscar por nombre o correo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-search-input"
                />
                <select
                  className="admin-role-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  aria-label="Filtrar por rol"
                >
                  <option value="all">Todos los roles</option>
                  <option value="student">Estudiantes</option>
                  <option value="teacher">Profesores</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td className="admin-table-email">{u.email}</td>
                      <td>
                        <select
                          className={`admin-role-badge role-${u.role}`}
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                          disabled={user?.role !== 'admin'}
                          aria-label={`Cambiar rol de ${u.name}`}
                        >
                          <option value="student">{ROLE_LABELS.student}</option>
                          <option value="teacher">{ROLE_LABELS.teacher}</option>
                          <option value="admin">{ROLE_LABELS.admin}</option>
                        </select>
                      </td>
                      <td>
                        <span className={`admin-status-badge ${u.status}`}>
                          {u.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => toggleStatus(u.id)}
                        >
                          {u.status === 'active' ? 'Desactivar' : 'Activar'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-table-empty">
                        No se encontraron usuarios con ese filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </article>

        {/* Panel lateral */}
        <aside className="col-12 col-lg-4" aria-label="Panel lateral de administración">
          <Card className="admin-modules-card mb-4">
            <h3 className="card-title icon-inline"><FaBookOpen /> Contenido por módulo</h3>
            <ul className="admin-modules-list list-unstyled">
              {MODULES.map((m) => (
                <li key={m.name} className="admin-module-item">
                  <span className="admin-module-icon">{m.icon}</span>
                  <div className="admin-module-info">
                    <span className="admin-module-name">{m.name}</span>
                    <span className="admin-module-meta">
                      {m.lessons} lecciones · {m.students} estudiantes
                    </span>
                  </div>
                  <Button variant="outline" size="small">
                    Editar
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="admin-actions-card">
            <h3 className="card-title icon-inline"><FaBolt /> Acciones rápidas</h3>
            <div className="actions-list">
              <Button variant="outline" fullWidth icon={<FaUserPlus />}>
                Invitar nuevo usuario
              </Button>
              <Button variant="outline" fullWidth icon={<FaChartBar />}>
                Ver reportes de progreso
              </Button>
              <Button variant="outline" fullWidth icon={<FaSchool />} disabled={user?.role !== 'admin'}>
                Gestionar instituciones
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default AdminPanel;
