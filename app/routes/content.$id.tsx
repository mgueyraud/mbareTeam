import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type User, type Role } from "@prisma/client";
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { Editor } from "novel";
import { useState } from "react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardEdit, Eraser } from "lucide-react";

import ComboboxDemo from "../components/autofill.users";
import { Exception } from "@prisma/client/runtime/library";
import ModifyColaborator from "~/components/list.colaborator.content";
import { ESTADO_INACTIVO, ESTADO_PUBLICADO } from "~/utils/constants";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  const id = params.id as string;

  const usuarios = await prisma.user.findMany({
    where: {
      NOT: {
        username: user.username,
      },
    },
  });
  console.log(usuarios);

  const content = await prisma.content.findUnique({
    where: {
      id,
    },
  });

  const roles = await prisma.role.findMany({
    where: {
      contentId: id,
    },
  });

  const colaboradores = await prisma.collaborator.findMany({
    where: {
      contentId: id,
    },
    include: {
      User: true,
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });
  if (content?.userGoogleId !== user.googleId) {
    //Si no soy el owner, checkear si tengo permisos
    const colab = colaboradores.find((c) => c.userGoogleId === user.googleId);
    if (!colab) {
      return redirect("/");
    }
    const hasPermission = colab.role.permissions.some((p) => p.name === "leer");
    if (!hasPermission) {
      return redirect("/");
    }
  }
  return json({ content, roles, colaboradores, usuarios });
};

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();
  const contentId = params.id as string;
  const intention = formData.get("intention");
  const intent = formData.get("intent");
  const rolId = formData.get("rol");
  const html = formData.get("html");

  if (html) {
    await prisma.content.update({
      where: {
        id: contentId,
      },
      data: {
        content: html,
      },
    });

    return json({});
  }

  if (typeof intent === "string") {
    try {
      const content = await prisma.content.update({
        where: {
          id: contentId,
        },
        data: {
          status: intent,
        },
      });
      return redirect("/dashboard");
    } catch {
      return json({ success: false, message: "Something went wrong!" });
    }
  }
  switch (intention) {
    case "editRole":
      return redirect("/edit/role/" + rolId);
      break;
    case "deleteRole":
      await prisma.role.delete({
        where: {
          id: rolId?.toString(),
        },
      });
      break;
    case "addColaborator":
      console.log("Haz seleccionado addColaborador");
      const entries = formData.entries();

      const colaboradorId = formData.get("colaboratorId")?.toString();

      const lector = (await prisma.role.findFirst({
        where: {
          contentId: contentId,  // Filtrar por contentId específico
          permissions: {
            some: {
              Permissions: {
                type: 'leer'  // Buscar permisos de tipo "leer"
              }
            }
          }
        }
      }) as Role;
      console.log("este es el rol lector")
      console.log(lector)
      if (lector !== null && lector !== undefined) {
        try {
          await prisma.collaborator.create({
            data: {
              userGoogleId: colaboradorId,
              contentId: contentId.toString(),
              roleId: lector.id,
            },
          });
        } catch(e: Exception) {
          alert("hubo un problema:"+e.message);
          return json({ success: false, message: "Something went wrong!" });
        }
      }

      break;
    case "deleteColaborator":
      const colaborador = formData.get("colaborador");
      await prisma.collaborator.delete({
        where: {
          id:colaborador,
        }
      });
    default:
      break;
  }
  return null;
};

export default function Content() {
  const { content, roles, colaboradores, usuarios } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [htmlContent, setHtmlContent] = useState("");
  const [valueAddColaborator, setValueAddColaborator] = useState("");
  const navigate = useNavigate();
  const id = content?.id as String;
  const navigateToCreateRole = () => {
    navigate(`/create/role/` + id);
  };

  const updateContent = (editor: any) => {
    submit(
      {
        html: JSON.stringify(editor.getJSON()),
      },
      { method: "POST" }
    );
  };

  const onCheckBoxChange = (value: any) => {
    setValueAddColaborator(value === valueAddColaborator ? "" : value);
    console.log(
      "El id del colaborador seleccionado es: " + valueAddColaborator
    );
  };

  return (
    <div>
      <Form method="POST">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{content?.title}</h1>
            <p className="text-lg font-500 text-gray-500">
              {content?.description}
            </p>
          </div>
          {/* TODO: Agregar validacion para pasar solo de En Revision */}
          <div>
            <Button name="intent" value={ESTADO_PUBLICADO}>
              Publicar
            </Button>
          </div>
          <div>
            <Button name="intent" value={ESTADO_INACTIVO}>
              Inactivar
            </Button>
          </div>
        </div>
      </Form>
      <Tabs defaultValue="content" className="w-full mt-7">
        <TabsList className="grid w-fit grid-cols-3 mb-6">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-4">
          <div>
            <input type="hidden" name="content" value={htmlContent} />
            <Editor
              defaultValue={JSON.parse(content?.content as any)}
              onDebouncedUpdate={updateContent}
              debounceDuration={1000}
              disableLocalStorage
            />
          </div>
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <h2 className="text-xl font-bold mt-5">Roles</h2>
          <div>
            <Table>
              <TableCaption>Lista de roles.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nombre</TableHead>
                  <TableHead className="text-left">Descripción</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((rol) => (
                  <TableRow key={rol.id}>
                    <TableCell className="">{rol.name}</TableCell>
                    <TableCell className="font-medium">
                      {rol.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Form method="post">
                        <Button
                          className="mr-1"
                          name="intention"
                          value="editRole"
                        >
                          <ClipboardEdit />
                        </Button>
                        <Button
                          variant="destructive"
                          name="intention"
                          value="deleteRole"
                        >
                          <Eraser />
                        </Button>
                      </Form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={navigateToCreateRole} className="mt-4" name="intent">
            Agregar rol
          </Button>
        </TabsContent>
        <TabsContent value="collaborators" className="space-y-4">
          <h2 className="text-xl font-bold mt-5">Colaboradores</h2>
          <Form method="post">
            <ComboboxDemo usuarios = {usuarios} onCheckBoxChange={onCheckBoxChange} ></ComboboxDemo>
            <Button
              className="mt-4 ml-2"
              name="intention"
              value="addColaborator"
            >
              Agregar colaborador
            </Button>
            <input
              type="hidden"
              name="colaboratorId"
              value={valueAddColaborator}
            />
          </Form>
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Nombre</TableHead>
                <TableHead className="text-left">Rol</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell className="">
                    {colaborador.User?.username}
                  </TableCell>
                  <TableCell className="font-medium">
                    {colaborador.role.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Form method="post">
                      <ModifyColaborator />
                      <input
                        type="hidden"
                        name="colaborador"
                        value={colaborador.id}
                      />
                    </Form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
