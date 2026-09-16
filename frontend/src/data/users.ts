import { User } from '../types';

// TODO: reemplazar por datos reales una vez exista el backend de autenticación.
// Usuarios de referencia para probar los distintos roles durante el desarrollo:
// inicia sesión con cualquiera de estos correos (cualquier contraseña) para
// ver la plataforma como profesor o administrador; cualquier otro correo
// ingresa como estudiante.
export const mockUsers: User[] = [
  {
    id: 'u-student-1',
    name: 'Estudiante Demo',
    email: 'estudiante@fisiomatbot.com',
    role: 'student',
    grade: 10,
  },
  {
    id: 'u-teacher-1',
    name: 'Profesor Demo',
    email: 'profesor@fisiomatbot.com',
    role: 'teacher',
    institution: 'Instituto Educativo',
  },
  {
    id: 'u-admin-1',
    name: 'Administrador Demo',
    email: 'admin@fisiomatbot.com',
    role: 'admin',
  },
];

export const findUserByEmail = (email: string): User | undefined =>
  mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
