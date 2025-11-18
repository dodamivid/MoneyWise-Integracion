/**
 * @fileoverview Clases de error personalizadas para manejo consistente de errores en la API de Money Wise.
 * 
 * Este módulo proporciona tipos de error especializados que extienden la clase Error base,
 * permitiendo un manejo consistente de errores y mapeo de códigos de estado HTTP a través
 * de la aplicación. Cada tipo de error corresponde a un código de estado HTTP específico.
 * 
 * @module utils/errors
 * @category Utils
 * 
 * @example
 * ```typescript
 * import { NotFoundError, ValidationError } from './utils/errors';
 * 
 * // Lanzar un error 404
 * throw new NotFoundError('Usuario', '123');
 * 
 * // Lanzar un error 400
 * throw new ValidationError('Formato de correo inválido');
 * ```
 * 
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

/**
 * Clase base para todos los errores de la aplicación.
 * 
 * Esta clase abstracta proporciona una estructura común para todos los errores personalizados
 * en la aplicación. Asegura que todos los errores tengan un código de estado y
 * puedan ser serializados apropiadamente a JSON para respuestas de la API.
 * 
 * @abstract
 * @extends Error
 * 
 * @property {string} name - El nombre de la clase de error
 * @property {string} message - El mensaje de error
 * @property {number} statusCode - El código de estado HTTP asociado con este error
 */
export abstract class AppError extends Error {
  /**
   * El código de estado HTTP que debería retornarse cuando este error es lanzado.
   * 
   * @type {number}
   * @readonly
   */
  public readonly statusCode: number;

  /**
   * Crea una nueva instancia de AppError.
   * 
   * @param {string} message - El mensaje de error describiendo qué salió mal
   * @param {number} statusCode - El código de estado HTTP para este error (ej. 404, 400, 500)
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    // Mantiene el stack trace apropiado para donde nuestro error fue lanzado (solo disponible en V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convierte el error a un objeto serializable a JSON.
   * 
   * Este método es útil para enviar respuestas de error a los clientes
   * en un formato consistente.
   * 
   * @returns {Object} Una representación de objeto plano del error
   * @returns {string} Object.status - Siempre "error" para respuestas de error
   * @returns {string} Object.message - El mensaje de error
   * @returns {number} Object.statusCode - El código de estado HTTP
   * 
   * @example
   * ```typescript
   * const error = new NotFoundError('Usuario', '123');
   * console.log(error.toJSON());
   * // Salida: { status: "error", message: "Usuario con id 123 no encontrado", statusCode: 404 }
   * ```
   */
  toJSON() {
    return {
      status: "error",
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Error lanzado cuando un recurso solicitado no se encuentra.
 * 
 * Este error corresponde al código de estado HTTP 404 y debe usarse
 * cuando un cliente solicita un recurso (como un usuario, transacción, etc.)
 * que no existe en el sistema.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Cuando un usuario no se encuentra
 * throw new NotFoundError('Usuario', userId);
 * 
 * // Cuando una transacción no se encuentra
 * throw new NotFoundError('Transacción', transactionId);
 * 
 * // Mensaje personalizado
 * throw new NotFoundError('El recurso solicitado no existe');
 * ```
 */
export class NotFoundError extends AppError {
  /**
   * Crea una nueva instancia de NotFoundError.
   * 
   * @param {string} resource - El tipo de recurso que no se encontró (ej. "Usuario", "Transacción")
   * @param {string} [id] - ID opcional del recurso que no se encontró
   * 
   * @example
   * ```typescript
   * // Con tipo de recurso e ID
   * throw new NotFoundError('Usuario', '123');
   * // Mensaje: "Usuario con id 123 no encontrado"
   * 
   * // Solo con tipo de recurso
   * throw new NotFoundError('Usuario');
   * // Mensaje: "Usuario no encontrado"
   * 
   * // Mensaje personalizado (cuando solo hay un parámetro y no hay segundo parámetro)
   * throw new NotFoundError('El recurso solicitado no existe');
   * ```
   */
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} con id ${id} no encontrado`
      : `${resource} no encontrado`;
    super(message, 404);
  }
}

/**
 * Error lanzado cuando la validación de entrada falla.
 * 
 * Este error corresponde al código de estado HTTP 400 y debe usarse
 * cuando la entrada del cliente no cumple con el formato requerido o las reglas de validación.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Error de validación simple
 * throw new ValidationError('El correo es requerido');
 * 
 * // Múltiples errores de validación
 * throw new ValidationError('Entrada inválida: el nombre es requerido, el correo debe ser válido');
 * 
 * // Usando con validación Zod
 * try {
 *   userSchema.parse(data);
 * } catch (error) {
 *   throw new ValidationError(error.message);
 * }
 * ```
 */
export class ValidationError extends AppError {
  /**
   * Crea una nueva instancia de ValidationError.
   * 
   * @param {string} message - Descripción de qué validación falló
   * 
   * @example
   * ```typescript
   * throw new ValidationError('El ID de usuario debe ser un UUID válido');
   * throw new ValidationError('El formato del correo es inválido');
   * throw new ValidationError('La contraseña debe tener al menos 8 caracteres');
   * ```
   */
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Error lanzado cuando una petición está mal formada o es inválida.
 * 
 * Este error corresponde al código de estado HTTP 400 y debe usarse
 * para escenarios generales de petición incorrecta que no encajan en errores de validación.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Encabezado requerido faltante
 * throw new BadRequestError('El encabezado Content-Type es requerido');
 * 
 * // Formato de petición inválido
 * throw new BadRequestError('El cuerpo de la petición debe ser JSON válido');
 * 
 * // Operación inválida
 * throw new BadRequestError('No se puede eliminar un usuario con transacciones activas');
 * ```
 */
export class BadRequestError extends AppError {
  /**
   * Crea una nueva instancia de BadRequestError.
   * 
   * @param {string} message - Descripción de por qué la petición es inválida
   * 
   * @example
   * ```typescript
   * throw new BadRequestError('Formato de petición inválido');
   * throw new BadRequestError('Campos requeridos faltantes');
   * ```
   */
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Error lanzado cuando ocurre un error interno del servidor.
 * 
 * Este error corresponde al código de estado HTTP 500 y debe usarse
 * para errores inesperados que ocurren del lado del servidor, como fallas
 * de conexión a la base de datos, excepciones inesperadas, etc.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Error de conexión a base de datos
 * throw new InternalServerError('Falló la conexión a la base de datos');
 * 
 * // Error inesperado
 * try {
 *   // Alguna operación
 * } catch (error) {
 *   throw new InternalServerError('Ocurrió un error inesperado');
 * }
 * ```
 */
export class InternalServerError extends AppError {
  /**
   * Crea una nueva instancia de InternalServerError.
   * 
   * @param {string} [message='Error interno del servidor'] - Descripción del error interno
   * 
   * @example
   * ```typescript
   * throw new InternalServerError();
   * throw new InternalServerError('Falló el procesamiento de la transacción');
   * ```
   */
  constructor(message: string = "Error interno del servidor") {
    super(message, 500);
  }
}

/**
 * Guardia de tipo para verificar si un error es una instancia de AppError.
 * 
 * Esta función ayuda a TypeScript a reducir el tipo de error y puede usarse
 * para diferenciar entre errores de aplicación personalizados y errores nativos de JavaScript.
 * 
 * @param {unknown} error - El error a verificar
 * @returns {boolean} True si el error es un AppError, false en caso contrario
 * 
 * @example
 * ```typescript
 * try {
 *   // Alguna operación
 * } catch (error) {
 *   if (isAppError(error)) {
 *     // TypeScript sabe que error es AppError aquí
 *     console.log(`Código de estado: ${error.statusCode}`);
 *     res.status(error.statusCode).json(error.toJSON());
 *   } else {
 *     // Manejar errores nativos
 *     console.error('Error inesperado:', error);
 *   }
 * }
 * ```
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
/**
 * Error lanzado cuando se intenta crear un recurso que ya existe.
 * YABINNNNNNNNNNNNN MALDONADO
 * Este error corresponde al código de estado HTTP 409 (Conflict) y debe usarse
 * cuando se intenta crear un recurso duplicado (ej. tipo de egreso con nombre existente).
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * throw new ConflictError('Ya existe un tipo de egreso con ese nombre');
 * ```
 */
export class ConflictError extends AppError {
  /**
   * Crea una nueva instancia de ConflictError.
   * 
   * @param {string} message - Descripción del conflicto
   * 
   * @example
   * ```typescript
   * throw new ConflictError('El recurso ya existe');
   * throw new ConflictError('Ya existe un tipo de egreso con ese nombre');
   * ```
   */
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Error lanzado cuando se intenta eliminar un recurso que está en uso.
 * 
 * Este error corresponde al código de estado HTTP 409 (Conflict) y debe usarse
 * cuando un recurso no puede ser eliminado porque está siendo referenciado.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * throw new ResourceInUseError('No se puede eliminar: el tipo de egreso está en uso');
 * ```
 */
export class ResourceInUseError extends AppError {
  /**
   * Crea una nueva instancia de ResourceInUseError.
   * 
   * @param {string} message - Descripción de por qué el recurso está en uso
   * 
   * @example
   * ```typescript
   * throw new ResourceInUseError('El tipo de egreso está siendo utilizado en transacciones');
   * ```
   */
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Error lanzado cuando un usuario no tiene permisos para realizar una acción.
 * 
 * Este error corresponde al código de estado HTTP 403 (Forbidden) y debe usarse
 * cuando un usuario autenticado intenta acceder a un recurso sin los permisos necesarios.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * throw new ForbiddenError('No tienes permiso para modificar tipos por defecto');
 * ```
 */
export class ForbiddenError extends AppError {
  /**
   * Crea una nueva instancia de ForbiddenError.
   * 
   * @param {string} [message='No tienes permisos para realizar esta acción'] - Descripción del permiso faltante
   * 
   * @example
   * ```typescript
   * throw new ForbiddenError();
   * throw new ForbiddenError('Se requiere rol de administrador');
   * ```
   */
  constructor(message: string = "No tienes permisos para realizar esta acción") {
    super(message, 403);
  }
}

/**
 * Error lanzado cuando falta autenticación o el token es inválido.
 * 
 * Este error corresponde al código de estado HTTP 401 (Unauthorized) y debe usarse
 * cuando un usuario no está autenticado o su token es inválido/expirado.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * throw new UnauthorizedError('Token JWT inválido o expirado');
 * ```
 */
export class UnauthorizedError extends AppError {
  /**
   * Crea una nueva instancia de UnauthorizedError.
   * 
   * @param {string} [message='No autorizado'] - Descripción del problema de autenticación
   * 
   * @example
   * ```typescript
   * throw new UnauthorizedError();
   * throw new UnauthorizedError('Token JWT expirado');
   * ```
   */
  constructor(message: string = "No autorizado") {
    super(message, 401);
  }
}