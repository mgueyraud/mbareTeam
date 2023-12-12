import { Button } from "@/components/ui/button";
import type { User } from "@prisma/client";
import { redirect, type ActionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { FilePlus2, MoveUpRight, Search } from "lucide-react";
import { prisma } from "~/utils/db.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"

import DropdownMenu from "@/components/ui/dropdownmenu";
import { Input } from "@/components/ui/input";

/**
 * Carga los datos necesarios para la página del panel de control.
 *
 * @param {ActionArgs} args - Argumentos del cargador.
 * @returns {Promise<{ user: User, contents: Content[], categorias: Category[] }>} - Promesa que resuelve en un objeto que contiene el usuario, el contenido y las categorías.
 */
export const loader = async ({ request }: ActionArgs) => {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('categoryId');
  const name = url.searchParams.get('name');
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  const contents = await prisma.content.findMany({
    where: {
      AND: [
        { OR: [
            {
              userGoogleId: user.googleId,
            },
            {
              collaborators: {
                some: {
                  userGoogleId: user.googleId,
                },
              },
            },
          ],
        },
        {
          title: name ? {
            search: name,
          } : {},
          contentType: categoryId ? {
            categoryId,
          } : {},
        }
      ]
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      contentType: {
        select: {
          Category: true,
        }
      }
    },
  });

  const categorias = await prisma.category.findMany();
  return {
    user,
    contents,
    categorias,
  };
};

/**
 * Componente funcional para el panel de control.
 *
 * @returns {ReactNode} - Nodo React que representa el panel de control.
 */
const Dashboard = () => {
  const { user, contents, categorias } = useLoaderData<typeof loader>();
  const categoria_select = function (option: ActionArgs) {
    console.log("opcion: ", option);
    
  }
  return (
    <Form method="GET">
      <div className="flex justify-between">
        <div className="flex flex-row gap-3 items-center">
          <DropdownMenu title= "Selecciona una Categoría" opciones={categorias} onChange={categoria_select} name="categoryId"></DropdownMenu>
          <Input name="name" placeholder="Buscar por titulo..." />
          <Button type="submit"><Search></Search></Button>
        </div>
        <div className="flex justify-between gap-3">
          <div>
            <Button>
              <Link to="/contenttype/list">
                Ver tipo de contenido
              </Link>
            </Button>
          </div>
          <div>
            <Button asChild>
              <Link to="/create/content">
                <FilePlus2 className="text-white" height={20} width={20} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {contents.length === 0 ? (
        <div className="border border-dashed rounded w-full py-10 flex flex-col items-center mt-8">
          <FilePlus2 className="text-gray-500" height={60} width={60} />
          <h2 className="text-xl font-bold mt-3">No content</h2>
          <Button className="mt-5" asChild>
            <Link to="/create/content">Create a new content</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex gap-8 flex-wrap">
          {contents.map((content) => (
            <Link key={content.id} to={`/content/${content.id}`}>
              <Card className="w-[350px]">
                <CardHeader className="">
                  <div className="flex flex-col">
                    <div className="justify-between flex flex-row">
                      <CardTitle>{content.title}</CardTitle>
                      <MoveUpRight width={20} height={20} />
                    </div>
                    <div className="my-2">
                      <Badge>{content.status}</Badge>
                    </div>
                    <div>
                      <Badge variant="outline">{content.contentType.Category.name}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{content.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Form>
  );
};

export default Dashboard;
