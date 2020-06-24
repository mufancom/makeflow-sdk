export function warningLog(message: string): void {
  console.warn(
    `[\x1b[34m power-app \x1b[0m${new Date().toISOString()}]: \x1b[33m ${message} \x1b[0m`,
  );
}

export function errorLog(error: Error): void {
  console.error(
    `[\x1b[34m power-app \x1b[0m${new Date().toISOString()}]:`,
    error,
  );
}
