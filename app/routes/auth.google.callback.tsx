import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { SocialsProvider } from "remix-auth-socials";

/**
 * Función de carga para autenticar a los usuarios mediante una cuenta de Google.
 * Esta función inicia el proceso de autenticación social utilizando el proveedor de servicios de Google.
 * @param {ActionArgs} args - Argumentos de la acción.
 * @param {Request} args.request - Objeto de solicitud HTTP.
 * @returns {Promise<RedirectResponse>} - Promesa que resuelve en una respuesta de redirección.
 */ 
export const loader = ({ request }: ActionArgs) => {
    /**
   * Inicia el proceso de autenticación social utilizando el proveedor de servicios de Google.
   * @function
   * @param {string} SocialsProvider.GOOGLE - Proveedor de servicios de autenticación de Google.
   * @param {Request} request - Objeto de solicitud HTTP.
   * @param {Object} options - Opciones de autenticación, incluyendo la URL de redirección en caso de éxito.
   * @param {string} options.successRedirect - URL de redirección en caso de autenticación exitosa.
   * @returns {Promise<RedirectResponse>} - Promesa que resuelve en una respuesta de redirección.
   */
  return authenticator.authenticate(SocialsProvider.GOOGLE, request, {
    successRedirect: "/dashboard",
  });
};
