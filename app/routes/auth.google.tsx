import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server.js";
import { SocialsProvider } from "remix-auth-socials";

/**
 * Función de acción para iniciar el proceso de autenticación utilizando el proveedor de servicios de Google.
 * Esta función se utiliza para manejar las solicitudes de autenticación social con Google.
 * @param {ActionArgs} args - Argumentos de la acción.
 * @param {Request} args.request - Objeto de solicitud HTTP.
 * @returns {Promise<RedirectResponse>} - Promesa que resuelve en una respuesta de redirección.
 */
export const action = async ({ request }: ActionArgs) => {
    /**
   * Inicia el proceso de autenticación social utilizando el proveedor de servicios de Google.
   * @function
   * @param {string} SocialsProvider.GOOGLE - Proveedor de servicios de autenticación de Google.
   * @param {Request} request - Objeto de solicitud HTTP.
   * @returns {Promise<RedirectResponse>} - Promesa que resuelve en una respuesta de redirección.
   */
  return await authenticator.authenticate(SocialsProvider.GOOGLE, request);
};
