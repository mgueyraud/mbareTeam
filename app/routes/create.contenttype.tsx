import { Button } from "@/components/ui/button";
import DropdownMenu from "@/components/ui/dropdownmenu";
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
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";

export async function action({ request }: ActionArgs) {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  if (!user)
    return json({ success: false, message: "User should be logged in" });

  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const categoryId = formData.get("categoryId");
  if (
    !name ||
    !description ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof categoryId !== "string"
  )
    return json({ success: false, message: "You should enter valid data" });

  try {
    await prisma.contentType.create({
      data: {
        name,
        description,
        categoryId,
      },
    });
  } catch {
    return json({ success: false, message: "Something went wrong!" });
  }

  return redirect("/contenttype/list");
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;
  const categorias = await prisma.category.findMany({});
  return {
    user,
    categorias,
  };
};

export default function CreateContentType() {
  const data = useActionData<typeof action>();
  const { categorias } = useLoaderData(); 
  const { toast } = useToast();

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
      <h1 className="text-2xl font-bold">Crear tipo de contenido</h1>
      <Form method="POST">
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" />
        </div>
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <div className="grid w-full items-center gap-1.5 mt-4">
            <Label htmlFor="categoryId">Categoría</Label>
            <DropdownMenu title="" opciones={categorias} id="categoryId" name="categoryId"></DropdownMenu>
          </div>
        <Button className="mt-3">Create</Button>
      </Form>
    </div>
  );
}
