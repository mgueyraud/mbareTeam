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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

/**
 *
 *
 * @export
 * @param {ActionArgs} { request }
 * @return {*}
 */
export async function action({ request }: ActionArgs) {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  if (!user)
    return json({ success: false, message: "El usuario debe iniciar sesión" });

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const contentTypeId = formData.get("contentTypeId");
  const expireDate = formData.get("expireDate");

  if (
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof contentTypeId !== "string" ||
    typeof expireDate !== "string"
  )
    return json({ success: false, message: "Debes ingresar datos válidos" });

  try {
    await prisma.content.create({
      data: {
        title,
        description,
        userGoogleId: user.googleId,
        contentTypeId,
        expireDate,
      },
    });
  } catch {
    return json({ success: false, message: "Algo salió mal!" });
  }
  return redirect("/dashboard");
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  const categorias = await prisma.category.findMany({
    where: {
      isActive: true,
    },
  });
  const contentTypes = await prisma.contentType.findMany();
  return {
    user,
    categorias,
    subcategorias: contentTypes,
  };
};
/**
 *
 *
 * @param {string} categoryID
 */
async function asignarCat(categoryID: string) {
  const contentypes = await prisma.contentType.findMany({
    where: { categoryId: categoryID },
  });
}

export default function CreateContent() {
  const data = useActionData<typeof action>();
  const { toast } = useToast();
  const { categorias, subcategorias } = useLoaderData<typeof loader>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [date, setDate] = useState<Date>(new Date());

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
      <h1 className="text-2xl font-bold">Crear un nuevo contenido.</h1>
      <Form method="POST">
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="title">Titulo</Label>
          <Input id="title" name="title" />
        </div>
        <div className="grid w-full items-center gap-1.5 mt-4">
          <div>
            <Label htmlFor="title">Categoría</Label>
            <DropdownMenu
              required
              title=""
              opciones={categorias}
              onChange={(value: string) => setSelectedCategoryId(value)}
              id="categoryId"
              name="categoryId"
            ></DropdownMenu>
          </div>
          <div>
            <Label htmlFor="title">Tipo de contenido</Label>
            <DropdownMenu
              required
              title=""
              opciones={subcategorias.filter(
                (sc) => sc.categoryId === selectedCategoryId
              )}
              id="contentTypeId"
              name="contentTypeId"
            ></DropdownMenu>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal mt-5",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Fecha vigencia</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="expireDate" value={date.toISOString()} />
        </div>
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" />
        </div>
        <Button className="mt-3">Crear</Button>
      </Form>
    </div>
  );
}
