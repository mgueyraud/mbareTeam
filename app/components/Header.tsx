import { Button } from "@/components/ui/button";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SocialsProvider } from "remix-auth-socials";
// import { Switch } from "@radix-ui/react-switch";
import type { User } from "@prisma/client";

export default function Header() {
  const data = useLoaderData<{ user: User }>();

  return (
    <div className="flex mt-4 justify-center border-b-2 border-slate-400">
      <nav className="max-w-screen-xl w-4/5 pb-2 flex justify-between">
        <div className="flex place-items-center space-x-4 lg:space-x-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            <img src="/images/mbareteam.png" className="h-9" alt="..."></img>
          </Link>
          <Link
            to="/home"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          {data && data.user && <>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/kanban"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Kanban
            </Link>
            <Link
              to="/contenttype/list"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Tipo de contenido
            </Link>
          </>}
        </div>
        {!data || !data.user ? (
          <div className="flex place-items-center space-x-4 lg:space-x-6">
            <Form method="post" action={`/auth/${SocialsProvider.GOOGLE}`}>
              <Button>Iniciar Sesion</Button>
            </Form>
          </div>
        ) : (
          <div className="flex place-items-center space-x-4 lg:space-x-6">
            <Popover>
              <PopoverTrigger>
                <div className="flex place-items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-slate-700">
                  <h3 className="mr-3">{data.user.name}</h3>
                  <Avatar>
                    <AvatarImage src={data.user.picture} />
                    <AvatarFallback>Nan</AvatarFallback>
                  </Avatar>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <ul className="list-none">
                  <li className="mb-2 text-black transition-all hover:cursor-pointer hover:text-slate-700">
                    <Link to="/profile">Profile</Link>
                  </li>
                  {/* <li className="mb-2 text-black transition-all hover:cursor-pointer hover:text-slate-700">
                    Configuración
                  </li>
                  <li className="mb-2 text-black transition-all hover:cursor-pointer hover:text-slate-700">
                    <div className="">
                      <span>Modo Oscuro</span>
                      <Switch />
                    </div>
                  </li> */}
                  <Separator />
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
        )}
      </nav>
    </div>
  );
}
