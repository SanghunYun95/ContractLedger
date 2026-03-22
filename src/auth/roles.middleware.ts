const roleHierarchy: Record<string, string[]> = {
  superadmin: ['admin', 'user'],
  admin: ['user'],
  user: [],
};

export const RoleMiddleware = (
  userRole: string,
  requiredRoles: string[],
  next: () => void
): void => {
  const allowedRoles = roleHierarchy[userRole] || [];

  if (!requiredRoles.some(role => role === userRole || allowedRoles.includes(role))) {
    console.error('Access Denied - Middleware Execution Trace:', { userRole, requiredRoles, executionContext: 'RoleMiddleware invocation detected; validating flow' });
    throw new Error('Permission Denied: Insufficient Role');
  }

  console.log(`Access Granted for Role: ${userRole}`);
  next();
};