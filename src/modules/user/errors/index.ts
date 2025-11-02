export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found') {
    super(message, 404);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, 401);
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(message: string = 'Email already registered') {
    super(message, 409);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class CPFAlreadyExistsError extends AppError {
  constructor(message: string = 'CPF already registered') {
    super(message, 409);
    this.name = 'CPFAlreadyExistsError';
  }
}

export class CORENAlreadyExistsError extends AppError {
  constructor(message: string = 'COREN already registered') {
    super(message, 409);
    this.name = 'CORENAlreadyExistsError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation error') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}