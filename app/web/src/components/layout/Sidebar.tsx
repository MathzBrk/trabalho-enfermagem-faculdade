import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Syringe,
  Calendar,
  Users,
  ClipboardList,
  BarChart3,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Minhas Vacinas',
    path: '/my-vaccines',
    icon: Syringe,
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Agenda',
    path: '/schedule',
    icon: Calendar,
    roles: ['NURSE'],
  },
  {
    label: 'Gerenciar Vacinas',
    path: '/vaccines',
    icon: ClipboardList,
    roles: ['MANAGER'],
  },
  {
    label: 'Usuários',
    path: '/users',
    icon: Users,
    roles: ['MANAGER'],
  },
  {
    label: 'Relatórios',
    path: '/reports',
    icon: BarChart3,
    roles: ['MANAGER'],
  },
  {
    label: 'Perfil',
    path: '/profile',
    icon: User,
  },
];

/**
 * Sidebar navigation component with role-based menu items
 */
export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-1 custom-scrollbar overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Univas Enfermagem v1.0.0
        </p>
      </div>
    </aside>
  );
};
