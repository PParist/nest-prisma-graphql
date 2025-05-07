// database-error.util.ts
import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class DatabaseErrorHandler {
  /**
   * Handles common database errors and throws appropriate exceptions
   * @param error The error object from the database operation
   * @param operation Description of the operation that failed
   * @param entityName Optional name of the entity being operated on
   */
  static handleError(
    error: any,
    operation: string,
    entityName?: string,
  ): never {
    const entity = entityName ? entityName : 'record';

    // Prisma specific error codes
    if (error.code) {
      switch (error.code) {
        // Record not found
        case 'P2025':
          throw new NotFoundException(
            `Failed to ${operation}: ${entity} not found`,
          );

        // Unique constraint violation
        case 'P2002': {
          const field = error.meta?.target?.[0] || 'field';
          throw new ConflictException(
            `Failed to ${operation}: ${entity} with this ${field} already exists`,
          );
        }

        // Foreign key constraint violation
        case 'P2003': {
          const field = error.meta?.field_name || 'reference';
          throw new BadRequestException(
            `Failed to ${operation}: Related ${field} not found`,
          );
        }

        // Required field constraint violation
        case 'P2011':
        case 'P2012':
          throw new BadRequestException(
            `Failed to ${operation}: Required field is missing`,
          );

        // Invalid data type
        case 'P2007':
          throw new BadRequestException(
            `Failed to ${operation}: Invalid data format`,
          );
      }
    }

    // Handle other error types from the ORM, database, or custom errors
    if (error instanceof NotFoundException) {
      throw error;
    }

    // Default to InternalServerError for unhandled database errors
    throw new InternalServerErrorException(
      `Failed to ${operation}: ${error.message || 'Unknown database error'}`,
    );
  }
}
