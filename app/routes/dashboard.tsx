// file: app/routes/dashboard.js

import { useLoaderData, Link, Form } from "@remix-run/react";
import { authenticator } from "../services/auth.server.js";
import type { ActionArgs } from "@remix-run/node";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button"
import { Switch } from "@radix-ui/react-switch";

export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  console.log(user);
  return {
    user,
  };
};
const lista =
  "mb-2 text-black transition-all hover:cursor-pointer hover:text-slate-700";
const cabecera =
  "mb-4 text-muted-foreground transition-all hover:cursor-default font-semibold";

const Dashboard = () => {
  // getting user from loader data
  const { user } = useLoaderData();
  // displaying authenticated user data
  return (
    <div className="text-black">
      <div className="dark:bg-slate-800 flex mt-4 justify-center border-b-2 border-slate-400">
        <nav className="max-w-screen-xl w-4/5 pb-2 flex justify-between">
          <div className="flex place-items-center space-x-4 lg:space-x-6">
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-black transition-colors hover:text-slate-700 hover:cursor-point"
            >
              <img src="./images/mbareteam.png" className="h-9" alt="..."></img>
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-black text-muted-foreground transition-colors hover:text-slate-700"
            >
              Contenido
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-black text-muted-foreground transition-colors hover:text-slate-700"
            >
              Caracteristicas
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-black text-muted-foreground transition-colors hover:text-slate-700"
            >
              Products
            </Link>
            <Link
              to="/examples/dashboard"
              className="text-sm font-medium text-black text-muted-foreground transition-colors hover:text-slate-700"
            >
              Settings
            </Link>
          </div>
          <div className="flex place-items-center space-x-4 lg:space-x-6">
            <Popover>
              <PopoverTrigger>
                <div className="flex place-items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-slate-700">
                  <h3 className="mr-3">{user.displayName}</h3>
                  <Avatar>
                    <AvatarImage src={user._json.picture} />
                    <AvatarFallback>Nan</AvatarFallback>
                  </Avatar>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <ul className="list-none">
                  <li className={lista}>Ver Perfil</li>
                  <li className={lista}>Configuración</li>
                  <li className={lista}><div className=""><span>Modo Oscuro</span><Switch /></div></li>
                  <Separator/>
                  <li>
                    <div className="w-100 flex justify-center mt-4">
                      <Form action="/logout" method="post">
                        <Button className="justify-self-auto">Logout</Button>
                      </Form>
                    </div>
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
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
    </div>
  );
};

export default Dashboard;
