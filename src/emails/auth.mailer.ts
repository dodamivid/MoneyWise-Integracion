/**
 * @fileoverview Servicio de envío de correos para autenticación
 * Por ahora simula el envío (logs en consola)
 * TODO: Integrar con nodemailer, sendgrid, etc.
 */

import { resetTokenConfig } from "../config/jwt.config";

export class AuthMailer {
  /**
   * Envía correo de bienvenida al registrarse
   */
  async enviarBienvenida(correo: string, nombre: string): Promise<boolean> {
    try {
      console.log("\n📧 ===== CORREO DE BIENVENIDA =====");
      console.log(`Para: ${correo}`);
      console.log(`Asunto: ¡Bienvenido a MoneyWise, ${nombre}!`);
      console.log(`Contenido:`);
      console.log(`  Hola ${nombre},`);
      console.log(`  Tu cuenta ha sido creada exitosamente.`);
      console.log(`  Ya puedes iniciar sesión y gestionar tus finanzas.`);
      console.log("====================================\n");

      // Simular delay de envío
      await new Promise((resolve) => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error("Error enviando correo de bienvenida:", error);
      // No fallar el registro si falla el correo
      return false;
    }
  }

  /**
   * Envía correo con link de restablecimiento de contraseña
   */
  async enviarRestablecimiento(
    correo: string,
    token: string
  ): Promise<boolean> {
    try {
      const linkRestablecer = `${resetTokenConfig.appUrl}/restablecer?token=${token}`;

      console.log("\n🔐 ===== CORREO DE RESTABLECIMIENTO =====");
      console.log(`Para: ${correo}`);
      console.log(`Asunto: Restablece tu contraseña - MoneyWise`);
      console.log(`Contenido:`);
      console.log(`  Hola,`);
      console.log(`  Recibimos una solicitud para restablecer tu contraseña.`);
      console.log(`  Haz clic en el siguiente enlace (válido por 15 minutos):`);
      console.log(`  `);
      console.log(`  ${linkRestablecer}`);
      console.log(`  `);
      console.log(`  Si no solicitaste esto, ignora este correo.`);
      console.log("========================================\n");

      // Simular delay de envío
      await new Promise((resolve) => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error("Error enviando correo de restablecimiento:", error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const authMailer = new AuthMailer();