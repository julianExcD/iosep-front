export class ErrorStatusMapper {
  private static readonly errorTypes: Record<string, number> = {
    TypeError: 400,
    RangeError: 416,
    SyntaxError: 400,
    ValidationError: 422,
    AuthenticationError: 401,
    AuthorizationError: 403,
  }

  static getStatus(error: Error): number {
    return this.errorTypes[error.name] || 500
  }
}