const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = "Operation timed out"
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
};

export default withTimeout;
