export class AppError extends Error {}

export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(
      `Unreachable case: ${typeof val === 'string' ? val : JSON.stringify(val)}`
    );
  }
}

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}
export class BadRequestError extends HttpError {
  constructor(message: string, public params?: any) {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

export class TableNotFoundError extends BadRequestError {
  constructor() {
    super('Table not found');
  }
}

export class InvalidMoveError extends BadRequestError {
  constructor(msg: string) {
    super('Invalid poker move: ' + msg);
  }
}
