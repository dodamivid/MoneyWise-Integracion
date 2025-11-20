/**
 * Datos semilla para pruebas de la API.
 */

import { CreateUserInput } from "../models/user.model";

export const sampleUsers: CreateUserInput[] = [
  {
    correo: "john.doe@example.com",
    contrasena: "Password123!",
    nombre: "John",
    apellidoP: "Doe",
    apellidoM: "Smith",
    fechaN: "1990-01-01",
    activo: true,
  },
  {
    correo: "jane.smith@example.com",
    contrasena: "SecurePass456!",
    nombre: "Jane",
    apellidoP: "Smith",
    apellidoM: "Johnson",
    fechaN: "1992-02-02",
    activo: true,
  },
  {
    correo: "bob.johnson@example.com",
    contrasena: "BobPass789!",
    nombre: "Bob",
    apellidoP: "Johnson",
    apellidoM: "Williams",
    fechaN: "1988-03-03",
    activo: false,
  },
  {
    correo: "alice.williams@example.com",
    contrasena: "AlicePass012!",
    nombre: "Alice",
    apellidoP: "Williams",
    apellidoM: "Brown",
    fechaN: "1994-04-04",
    activo: true,
  },
  {
    correo: "charlie.brown@example.com",
    contrasena: "CharliePass345!",
    nombre: "Charlie",
    apellidoP: "Brown",
    apellidoM: "Davis",
    fechaN: "1996-05-05",
    activo: true,
  },
];

export async function seedDatabase(repository: any): Promise<void> {
  console.log("Sembrando base de datos con usuarios de ejemplo...");

  for (const userData of sampleUsers) {
    try {
      await repository.create(userData);
      console.log(`Usuario creado: ${userData.correo}`);
    } catch (error: any) {
      console.log(`El usuario ya existe: ${userData.correo}`);
    }
  }

  console.log("Sembrado de base de datos completado");
}

export const testCredentials = {
  admin: {
    correo: "john.doe@example.com",
    contrasena: "Password123!",
  },
  regularUser: {
    correo: "jane.smith@example.com",
    contrasena: "SecurePass456!",
  },
  inactiveUser: {
    correo: "bob.johnson@example.com",
    contrasena: "BobPass789!",
  },
};
