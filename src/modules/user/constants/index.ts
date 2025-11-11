import type { User } from '@shared/models/user';

export const allowedUserSortFields = [
  'id',
  'name',
  'email',
  'cpf',
  'coren',
  'role',
  'phone',
  'isActive',
  'createdAt',
  'updatedAt',
];

export const DEFAULT_USER_SYSTEM_ID = '00000000-0000-0000-0000-000000000000';

/**
 *
 * Default system user used for authored actions performed by the system itself, not for actual data operations by a real user.
 */
export const DEFAULT_USER_SYSTEM: User = {
  id: DEFAULT_USER_SYSTEM_ID,
  name: 'User System',
  email: 'user.system@example.com',
  cpf: '12345678900',
  phone: '123456789',
  role: 'MANAGER',
  coren: '12345',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  password: '',
  deletedAt: null,
};
