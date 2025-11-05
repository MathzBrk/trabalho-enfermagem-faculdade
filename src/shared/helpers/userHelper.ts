import type { User, UserResponse } from '@shared/models/user';

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const toUserResponse = (user: User): UserResponse => {
  return {
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    phone: user.phone,
    role: user.role,
    coren: user.coren,
    id: user.id,
    isActive: user.isActive,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  };
};

interface PermissionCheckParams {
  requester: User; // The user making the request
  targetUser: User; // The user being accessed or modified
  reqType: 'view' | 'modify' | 'delete'; // Type of request: 'view', 'modify', or 'delete'
  dataUpdates?: Partial<User>; // Optional data updates for 'modify' requests
}

/**
 * Centralized authorization logic for user access control
 *
 * This function implements role-based access control (RBAC) with contextual rules:
 *
 * Authorization Rules:
 * - VIEW:
 *   - MANAGER: Can view any user
 *   - Others: Can only view themselves
 *
 * - MODIFY:
 *   - MANAGER: Can modify any user, all fields
 *   - Others: Can only modify themselves, restricted fields only
 *   - Restricted fields for non-MANAGER: isActive, role
 *
 * - DELETE:
 *   - Only MANAGER can delete users
 *   - Cannot delete yourself (prevents accidental lockout)
 *
 * @param params - Permission check parameters
 * @param params.requester - User making the request
 * @param params.targetUser - User being accessed/modified/deleted
 * @param params.reqType - Type of operation: 'view', 'modify', or 'delete'
 * @param params.dataUpdates - Optional fields being updated (for granular validation)
 * @returns true if access is allowed, false otherwise
 *
 * @example
 * // Manager viewing any user
 * canAccessUser({
 *   requester: managerUser,
 *   targetUser: employeeUser,
 *   reqType: 'view'
 * }); // returns true
 *
 * @example
 * // Employee viewing their own profile
 * canAccessUser({
 *   requester: employeeUser,
 *   targetUser: employeeUser,
 *   reqType: 'view'
 * }); // returns true
 *
 * @example
 * // Employee trying to update role (restricted field)
 * canAccessUser({
 *   requester: employeeUser,
 *   targetUser: employeeUser,
 *   reqType: 'modify',
 *   dataUpdates: { role: 'MANAGER' }
 * }); // returns false
 *
 * @example
 * // Employee updating their own name (allowed field)
 * canAccessUser({
 *   requester: employeeUser,
 *   targetUser: employeeUser,
 *   reqType: 'modify',
 *   dataUpdates: { name: 'New Name' }
 * }); // returns true
 *
 * @example
 * // Manager deleting another user
 * canAccessUser({
 *   requester: managerUser,
 *   targetUser: employeeUser,
 *   reqType: 'delete'
 * }); // returns true
 *
 * @example
 * // Manager trying to delete themselves
 * canAccessUser({
 *   requester: managerUser,
 *   targetUser: managerUser,
 *   reqType: 'delete'
 * }); // returns false
 */
export const canAccessUser = ({
  requester,
  targetUser,
  reqType,
  dataUpdates,
}: PermissionCheckParams): boolean => {
  const isManager = requester.role === 'MANAGER';
  const isSelf = requester.id === targetUser.id;

  switch (reqType) {
    case 'view': {
      // MANAGER can view any user, others can only view themselves
      return isManager || isSelf;
    }

    case 'modify': {
      // MANAGER can modify any user
      if (isManager) {
        return true;
      }

      // Non-managers can only modify themselves
      if (!isSelf) {
        return false;
      }

      // If modifying self, check if trying to update restricted fields
      if (dataUpdates) {
        const restrictedFields: (keyof User)[] = ['isActive', 'role'];
        const isUpdatingRestrictedField = restrictedFields.some(
          (field) => dataUpdates[field] !== undefined,
        );

        if (isUpdatingRestrictedField) {
          return false; // Non-managers cannot update restricted fields
        }
      }

      return true; // Can modify self with allowed fields
    }

    case 'delete': {
      // Only MANAGER can delete users
      if (!isManager) {
        return false;
      }

      // Cannot delete yourself (prevent accidental lockout)
      if (isSelf) {
        return false;
      }

      return true;
    }

    default:
      return false;
  }
};
