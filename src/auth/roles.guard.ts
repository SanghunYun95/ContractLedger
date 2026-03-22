export const RolesGuard = (requiredRole: string, userRole: string): boolean => {
  return userRole === requiredRole;
};