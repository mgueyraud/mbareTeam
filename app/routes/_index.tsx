import type { V2_MetaFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
import { Button } from "@/components/ui/button";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
const lista =
  "mb-2 text-muted-foreground transition-all hover:cursor-pointer hover:text-primary";
const cabecera =
  "mb-4 text-muted-foreground transition-all hover:cursor-default font-semibold";

export default function Index() {
  return (
    <>
      <div className="flex mt-4 justify-center border-b-2 border-slate-400">
        <nav className="max-w-screen-xl w-4/5 pb-2 flex justify-between">
          <div className="flex place-items-center space-x-4 lg:space-x-6">
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <img src="./images/mbareteam.png" className="h-9" alt="..."></img>
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contenido
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Caracteristicas
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Products
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Settings
            </Link>
          </div>
          <div className="flex place-items-center space-x-4 lg:space-x-6">
            <Form method="post" action={`/auth/${SocialsProvider.GOOGLE}`}>
              <Button>Iniciar Sesion</Button>
            </Form>
          </div>
        </nav>
      </div>
      <div className="flex items-center	m-auto w-4/5 h-screen">
        <div className="inline-block align-top max-w-screen-xl pb-2 justify-between h-full border-r-2">
          <div className="ml-6 pr-6 place-items-center space-x-4 lg:space-x-6 mt-4">
            <ol>
              <li className={cabecera}>Categorías</li>
              <li className={lista}>Torneos</li>
              <li className={lista}>Deportes</li>
              <li className={lista}>Gastronomisa</li>
              <li className={lista}>Politica</li>
              <li className={lista}>Reseñas</li>
              <li className={lista}>Noticias</li>
              <li className={lista}>Informatica</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
