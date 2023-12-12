import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server.js";

/**
 * Cierra la sesión del usuario y redirige a la página de inicio.
 *
 * @param {ActionArgs} options - Los argumentos de la acción.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se cierra la sesión del usuario.
 * @throws {Error} Si ocurre un error durante el proceso de cierre de sesión.
 *
 * @example
 * // Uso de la función action
 * await action({ request });
 */
export const action = async ({ request }:ActionArgs) => {
  await authenticator.logout(request, { redirectTo: "/" });
};