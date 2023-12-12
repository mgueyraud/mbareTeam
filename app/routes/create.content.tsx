import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import {
  json,
  type ActionArgs,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";
import { Link, useLoaderData } from "@remix-run/react";
import DropdownMenu from "@/components/ui/dropdownmenu";



/**
 * Acción para crear nuevo contenido.
 *
 * @param {ActionArgs} args - Argumentos de la acción.
 * @returns {Promise<RedirectResponse | JsonResponse>} - Promesa que resuelve en una respuesta de redirección o un objeto JSON de respuesta.
 */
export async function action({ request }: ActionArgs) {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  if (!user)
    return json({ success: false, message: "User should be logged in" });

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const contentTypeId = formData.get("contentTypeId");
  if (
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof contentTypeId !== "string"
  )
    return json({ success: false, message: "You should enter valid data" });

  try {
    await prisma.content.create({
      data: {
        title,
        description,
        userGoogleId: user.googleId,
        contentTypeId,
      },
    });
  } catch {
    return json({ success: false, message: "Something went wrong!" });
  }

  return redirect("/dashboard");
}

/**
 * Carga los datos necesarios para la página de creación de contenido.
 *
 * @param {LoaderArgs} args - Argumentos del cargador.
 * @returns {Promise<{ user: User, categorias: Category[], subcategorias: ContentType[] }>} - Promesa que resuelve en un objeto que contiene el usuario, las categorías y los tipos de contenido.
 */
export const loader = async ({ request }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;


  const categorias = await prisma.category.findMany();
  const contentTypes = await prisma.contentType.findMany();
  return {
    user,
    categorias,
    subcategorias: contentTypes,
  };
};
/**
 * Función para asignar tipos de contenido basados en una categoría seleccionada.
 *
 * @param {string} categoryID - ID de la categoría seleccionada.
 * @returns {Promise<void>} - Promesa que resuelve sin valor.
 */
async function asignarCat( categoryID: string) {
  const contentypes = await prisma.contentType.findMany({
    where: { categoryId: categoryID }
  });
};

/**
 * Componente funcional para la creación de nuevo contenido.
 *
 * @returns {ReactNode} - Nodo React que representa el formulario de creación de contenido.
 */
export default function CreateContent() {
  const data = useActionData<typeof action>();
  const { toast } = useToast();
  const { user, categorias, subcategorias } = useLoaderData<typeof loader>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (data && data.success) {
      toast({
        title: "Success",
        description: data.message,
        variant: "default",
      });
    } else if (data && !data.success) {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    }
  }, [data, toast]);
  return (
    <div>
      <h1 className="text-2xl font-bold">Create new content</h1>
      <Form method="POST">
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" />
        </div>
        <div className="grid w-full items-center gap-1.5 mt-4">
          <div>
            <Label htmlFor="title">Categoría</Label>
            <DropdownMenu title="" opciones={categorias} onChange={(value: string) => setSelectedCategoryId(value)} id="categoryId" name="categoryId"></DropdownMenu>
          </div>
          <div>
            <Label htmlFor="title">Tipo de contenido</Label>
            <DropdownMenu title="" opciones={subcategorias.filter(sc => sc.categoryId === selectedCategoryId)} id="contentTypeId" name="contentTypeId"></DropdownMenu>
          </div>
          </div>
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <Button className="mt-3">Create</Button>
      </Form>
    </div>
  );
}
