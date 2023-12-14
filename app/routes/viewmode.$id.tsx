import { type User, type Role } from "@prisma/client";
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";

import TiptapViewMode from "~/components/TiptapViewMode";

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
  console.log(rolId);

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
    case "updateHtml":
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
      break;
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
      const roleColaboradorId = formData.get("colaboratorRoleId");
      const colaboradorId = formData.get("colaboratorId")?.toString();

      const lector = (await prisma.role.findUnique({
        where: {
          id: roleColaboradorId?.toString(),
          contentId: contentId, // Filtrar por contentId específico
        },
      })) as Role;
      console.log("este es el rol lector");
      console.log(lector);
      if (lector !== null && lector !== undefined) {
        try {
          await prisma.collaborator.create({
            data: {
              userGoogleId: colaboradorId,
              contentId: contentId.toString(),
              roleId: lector.id,
            },
          });
        } catch (e: any) {
          alert("hubo un problema:" + e.message);
          return json({ success: false, message: "Something went wrong!" });
        }
      }

      break;
    case "deleteColaborator":
      const colaborador = formData.get("colaborador");
      await prisma.collaborator.delete({
        where: {
          id: colaborador,
        },
      });
    default:
      break;
  }
  return null;
};

export default function Content() {
  const { content, roles, colaboradores, usuarios } =
    useLoaderData<typeof loader>();
  const [valueAddColaborator, setValueAddColaborator] = useState("");
  const [roleAddColaborator, setRoleAddColaborator] = useState("");

  const navigate = useNavigate();
  const id = content?.id as String;
  const navigateToCreateRole = () => {
    navigate(`/create/role/` + id);
  };

  const userCheckHandler = (value: any) => {
    setValueAddColaborator(value === valueAddColaborator ? "" : value);
    console.log(
      "El id del colaborador seleccionado es: " + valueAddColaborator
    );
  };

  const roleCheckHandler = (value: any) => {
    setRoleAddColaborator(value === roleAddColaborator ? "" : value);
    console.log("El id del rol seleccionado es: " + roleAddColaborator);
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
        </div>
      </Form>
        <div>
            <TiptapViewMode html={content?.content ?? ""} />
        </div>
        
    </div>
  );
}
