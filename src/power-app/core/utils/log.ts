export function warning(message: string): void {
  console.warn(
    `[\x1b[34m makeflow-sdk \x1b[0m${new Date().toISOString()}]: \x1b[33m ${message} \x1b[0m`,
  );
}
