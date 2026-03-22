export const validateUserData = (data: { name: string; email: string }) => {
  const errors = [];
  if (!data.name || data.name.trim() === '') errors.push('Name is required.');
  if (!data.email || !data.email.includes('@')) errors.push('Valid email is required.');

  if (errors.length > 0) throw new Error(`Validation Error: ${errors.join(' ')}`);
};