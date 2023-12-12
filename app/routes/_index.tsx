import { redirect, type ActionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

/**
 * Función de carga para la página de inicio.
 * Esta función comprueba si el usuario está autenticado. Si el usuario está autenticado, lo redirige al dashboard.
 * @param {ActionArgs} args - Argumentos de la acción.
 * @param {Request} args.request - Objeto de solicitud HTTP.
 * @returns {Promise<{ user?: User }>} - Promesa que resuelve en un objeto que contiene el usuario autenticado, si existe.
 */
export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = await authenticator.isAuthenticated(request);

  if (user) {
    return redirect("/dashboard");
  }

  return {
    user,
  };
};

/**
 * Componente principal para la página de inicio.
 * @component
 * @example
 * // Uso del componente en JSX/TSX
 * <Index />
 * @returns {JSX.Element} - Elemento JSX que representa la página de inicio.
 */
export default function Index() {
  return <div></div>;
}
