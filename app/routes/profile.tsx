import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "@prisma/client";
import { ReloadIcon } from "@radix-ui/react-icons";
import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { X } from "lucide-react";
import { useEffect } from "react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderArgs) {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  const data = await prisma.user.findUnique({
    where: { googleId: user.googleId },
    select: { description: true, username: true },
  });

  const description = (data && data.description) ?? "";
  const username = (data && data.username) ?? "";

  return json({ description, username });
}

export async function action({ request }: ActionArgs) {
  const user = (await authenticator.isAuthenticated(request)) as User;
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "delete":
      await prisma.user.delete({
        where: {
          googleId: user.googleId,
        },
      });

      await authenticator.logout(request, { redirectTo: "/" });
      return json({
        success: true,
        message: "Usuario eliminado exitosamente",
      });
    case "update":
      const username = "" + formData.get("username");
      const description = "" + formData.get("description");

      await prisma.user.update({
        where: {
          googleId: user.googleId,
        },
        data: {
          username,
          description,
        },
      });

      return json({
        success: true,
        message: "Datos de usuario actualizados exitosamente",
      });
  }

  return json({
    success: false,
    message: "Algo salió mal",
  });
}

export default function Profile() {
  const { username, description } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const { toast } = useToast();
  const navigation = useNavigation();

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

  const isLoadingUpdate =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "update";

  const isLoadingDelete =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "delete";

  return (
    <div>
      <Form method="POST">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input id="username" name="username" defaultValue={username} />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-5">
          <Label htmlFor="description">Descripcion</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={description}
          />
        </div>
        <Button
          className="mt-4"
          name="intent"
          value="update"
          disabled={isLoadingUpdate}
        >
          {isLoadingUpdate ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            "Actualizar"
          )}
        </Button>
      </Form>
      <Card className="mt-10 border-red-600">
        <CardHeader>
          <CardTitle>Eliminar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Una vez presionado el boton, no podra revertir la accion.</p>
        </CardContent>
        <CardFooter>
          <Form method="POST">
            <Button
              className="bg-red-600"
              name="intent"
              value="delete"
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" /> Eliminar
                </>
              )}
            </Button>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
