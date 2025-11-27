import type { VaccineSchedulingFilterParams } from '@shared/interfaces/vaccineScheduling';
import type { User } from '@shared/models/user';

export const defineFilterParams = (
  requestingUser: Omit<User, 'password' | 'deletedAt'>,
  filters: VaccineSchedulingFilterParams,
): VaccineSchedulingFilterParams => {
  const isNurse = requestingUser.role === 'NURSE';
  const isEmployee = requestingUser.role === 'EMPLOYEE';
  const isManager = requestingUser.role === 'MANAGER';

  // SCENARIO 1: Nurse Dashboard (assignedNurseId provided)
  // Show schedulings assigned to this nurse + unassigned ones
  if (isNurse && filters.assignedNurseId) {
    return {
      ...filters,
      assignedNurseId: requestingUser.id, // Security: force their own ID
      userId: undefined, // Don't filter by patient
    };
  }

  // SCENARIO 2: My Appointments (userId explicitly provided)
  // User wants to see appointments where they are the PATIENT
  // ALL roles (NURSE, EMPLOYEE, MANAGER) can only see their own appointments
  if (filters.userId) {
    return {
      ...filters,
      userId: requestingUser.id, // Security: always force their own ID
      assignedNurseId: undefined, // Don't filter by nurse assignment
    };
  }

  // SCENARIO 3: No explicit filter provided - Default behavior

  // For NURSE: Default to dashboard view (assigned + unassigned)
  if (isNurse) {
    return {
      ...filters,
      assignedNurseId: requestingUser.id,
      userId: undefined,
    };
  }

  // For EMPLOYEE and MANAGER: Default to "my appointments" view
  if (isEmployee || isManager) {
    return {
      ...filters,
      userId: requestingUser.id,
      assignedNurseId: undefined,
    };
  }

  // Fallback: return filters as-is
  return filters;
};
