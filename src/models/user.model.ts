// Implementación de GET /api/users/:id
// api petición para obtener un usuario por ID
// ============================================
// INTERFACES - Contratos de Datos
// ============================================


/**
 * export - Compartir código entre archivos
 * export hace que algo esté disponible para ser usado en otros archivos. (es publico)
 * 
 * interface - Define la forma de un objeto
 * interface es como un contrato o molde que describe qué propiedades debe tener un objeto.
 * Interface User: Define la estructura COMPLETA de un usuario en el sistema
 * Esta es la representación interna que incluye información sensible
 * agregar un ? después del nombre de una propiedad la hace opcional
 */
export interface User {
  id: string;              // Identificador único del usuario (UUID)
  email: string;           // Correo electrónico (único por usuario)
  password: string;        // Contraseña HASHEADA (nunca en texto plano)
  firstName: string;       // Nombre(s) del usuario
  lastName: string;        // Apellido(s) del usuario
  createdAt: Date;        // Fecha de creación del registro
  updatedAt: Date;        // Fecha de última actualización
}

/**
 * Interface UserResponse: Define lo que SE ENVÍA al cliente
 * IMPORTANTE: NO incluye el password por seguridad
 * Esta es la versión "pública" del usuario
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  // ❌ NO tiene password - nunca lo enviamos al frontend
}

/**
 * UserStore: Clase estática que simula una base de datos en memoria
 * 
 * ¿Por qué estática? 
 * - No necesitamos crear instancias (new UserStore())
 * - Todos los métodos se llaman directamente: UserStore.findById()
 * - Mantiene UN SOLO almacén compartido en toda la aplicación
 */
export class UserStore {
  
  // ============================================
  // ALMACENAMIENTO PRIVADO
  // ============================================
  
  /**
   * users: Map privado que almacena todos los usuarios
   * 
   * ¿Qué es un Map?
   * - Estructura clave-valor (como un objeto, pero mejor)
   * - Clave: ID del usuario (string)
   * - Valor: Objeto User completo
   * 
   * ¿Por qué Map y no Array?
   * - Búsqueda O(1) - instantánea por ID
   * - Array sería O(n) - tendría que recorrer todo
   * 
   * ¿Por qué private static?
   * - private: Solo accesible dentro de esta clase
   * - static: Compartido por toda la aplicación, no por instancia
   * 
   * Ejemplo en memoria:
   * users = Map {
   *   "uuid-123" => { id: "uuid-123", email: "juan@mail.com", ... },
   *   "uuid-456" => { id: "uuid-456", email: "maria@mail.com", ... }
   * }
   */
  private static users: Map<string, User> = new Map();

  // ============================================
  // MÉTODOS DE BÚSQUEDA (READ)
  // ============================================

  /**
   * findById: Busca un usuario por su ID
   * 
   * @param id - El ID único del usuario
   * @returns User si lo encuentra, undefined si no existe
   * 
   * Complejidad: O(1) - búsqueda instantánea
   * 
   * Ejemplo de uso:
   * const user = UserStore.findById("uuid-123");
   * if (user) {
   *   console.log(user.email); // "juan@mail.com"
   * }
   */
  static findById(id: string): User | undefined {
    return this.users.get(id);
    // .get() es el método de Map para obtener un valor por clave
    // Si no existe, Map devuelve undefined automáticamente
  }

  /**
   * findByEmail: Busca un usuario por su email
   * 
   * ¿Por qué es diferente a findById?
   * - El Map usa ID como clave, NO email
   * - Tenemos que buscar manualmente en todos los valores
   * 
   * Complejidad: O(n) - tiene que revisar todos los usuarios
   * 
   * Proceso paso a paso:
   * 1. Array.from(this.users.values()) - Convierte los valores del Map a Array
   * 2. .find() - Busca el primer elemento que cumpla la condición
   * 3. user => user.email === email - Compara cada email
   * 
   * @param email - Email a buscar
   * @returns User si existe, undefined si no
   */
  static findByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(
      user => user.email === email
    );
  }

  // ============================================
  // MÉTODOS DE CREACIÓN (CREATE)
  // ============================================

  /**
   * create: Agrega un nuevo usuario al almacén
   * 
   * @param user - Objeto User completo (debe incluir ID generado)
   * @returns El mismo usuario que se guardó
   * 
   * ⚠️ IMPORTANTE: 
   * - El ID debe venir ya generado (con uuid library)
   * - Este método NO valida duplicados (eso lo hace el controller)
   * - .set() sobrescribe si el ID ya existe
   * 
   * Ejemplo:
   * const newUser = {
   *   id: uuidv4(),
   *   email: "nuevo@mail.com",
   *   password: await bcrypt.hash("password123", 10),
   *   firstName: "Carlos",
   *   lastName: "López",
   *   createdAt: new Date(),
   *   updatedAt: new Date()
   * };
   * UserStore.create(newUser);
   */
  static create(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // ============================================
  // MÉTODOS DE ACTUALIZACIÓN (UPDATE)
  // ============================================

  /**
   * update: Actualiza un usuario existente
   * 
   * @param id - ID del usuario a actualizar
   * @param userData - Objeto con los campos a actualizar (parcial)
   * @returns Usuario actualizado, o undefined si no existe
   * 
   * ¿Cómo funciona Partial<User>?
   * - Hace que TODAS las propiedades de User sean opcionales
   * - Puedes enviar solo { firstName: "Nuevo Nombre" }
   * - No necesitas enviar TODOS los campos
   * 
   * Proceso:
   * 1. Busca el usuario actual
   * 2. Si no existe, retorna undefined
   * 3. Combina datos antiguos con nuevos usando spread operator (...)
   * 4. Actualiza automáticamente updatedAt
   * 5. Guarda y retorna el usuario actualizado
   */
  static update(id: string, userData: Partial<User>): User | undefined {
    const user = this.users.get(id);
    
    if (!user) return undefined;

    // Spread operator: combina objetos
    // Orden importa: userData sobrescribe user
    const updatedUser = {
      ...user,           // Todos los campos existentes
      ...userData,       // Campos nuevos/modificados
      updatedAt: new Date()  // Forzamos nueva fecha
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // ============================================
  // MÉTODOS DE ELIMINACIÓN (DELETE)
  // ============================================

  /**
   * delete: Elimina un usuario del almacén
   * 
   * @param id - ID del usuario a eliminar
   * @returns true si se eliminó, false si no existía
   * 
   * Map.delete() retorna:
   * - true: Si la clave existía y se eliminó
   * - false: Si la clave no existía
   */
  static delete(id: string): boolean {
    return this.users.delete(id);
  }

  // ============================================
  // MÉTODOS DE LISTADO
  // ============================================

  /**
   * getAll: Obtiene TODOS los usuarios
   * 
   * @returns Array con todos los usuarios
   * 
   * ⚠️ CUIDADO en producción:
   * - Con muchos usuarios, esto puede ser pesado
   * - Considera paginación (offset/limit)
   * 
   * Array.from(this.users.values()):
   * - .values() obtiene un iterador de todos los valores
   * - Array.from() convierte el iterador en array
   */
  static getAll(): User[] {
    return Array.from(this.users.values());
  }

  // ============================================
  // MÉTODOS UTILITARIOS
  // ============================================

  /**
   * toUserResponse: Convierte User a UserResponse
   * 
   * ¿Para qué sirve?
   * - SEGURIDAD: Elimina el password antes de enviar al cliente
   * - Siempre usar esto antes de enviar respuesta HTTP
   * 
   * ¿Cómo funciona?
   * 1. Destructuring: separa password del resto
   * 2. Rest operator (...): agrupa el resto en userResponse
   * 3. Retorna objeto SIN password
   * 
   * Ejemplo:
   * const user = { id: "1", email: "test@mail.com", password: "hash123", firstName: "Juan" }
   * const safe = UserStore.toUserResponse(user);
   * // safe = { id: "1", email: "test@mail.com", firstName: "Juan" }
   * // ✅ NO tiene password
   */
  static toUserResponse(user: User): UserResponse {
    const { password, ...userResponse } = user;
    return userResponse;
  }
}