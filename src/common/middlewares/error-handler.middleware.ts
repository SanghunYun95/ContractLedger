export const errorHandler = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
  console.error('Error:', error.message);
}
      throw new Error('Internal Server Error');
    }
  };
};