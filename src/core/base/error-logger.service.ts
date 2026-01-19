export class ErrorLogger {
  static log(context: string, type: string, details: unknown, timestamp: string): void {
    console.error({
      context,
      type,
      timestamp,
      details,
    })
  }
}