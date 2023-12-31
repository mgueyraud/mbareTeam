import { Content, User } from "@prisma/client";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { FilePlus2, MoveUpRight, Search } from "lucide-react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ESTADO_BORRADOR,
  ESTADO_INACTIVO,
  ESTADO_PUBLICADO,
  ESTADO_REVISION,
} from "~/utils/constants";
import { DragEvent, useRef } from "react";
import { sendEmail } from "~/utils/email.server";
import { Button } from "@/components/ui/button";

export const loader = async ({ request }: ActionArgs) => {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");
  const name = url.searchParams.get("name");
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  const contents = await prisma.content.findMany({
    where: {
      AND: [
        {
          OR: [
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
          title: name
            ? {
                search: name,
              }
            : {},
          contentType: categoryId
            ? {
                categoryId,
              }
            : {},
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      contentType: {
        select: {
          Category: true,
        },
      },
    },
  });

  const categorias = await prisma.category.findMany({
    where: {
      isActive: true,
    }
  });
  return {
    user,
    contents,
    categorias,
  };
};
export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");
  const status = formData.get("status");
  if(intent === "STATUS_CHANGE"){
    if (
      typeof intent === "string" &&
      typeof id === "string" &&
      typeof status === "string"
    ) {
      
        try {
          const content = await prisma.content.update({
            where: {
              id,
            },
            data: {
              status,
            },
            include: {
              User: true,
            },
          });

          await sendEmail({
            from: "Mbareteam <hello@resend.dev>",
            to: content.User?.email ?? "",
            subject: `Cambio de estado del proyeco ${content.title}`,
            html: `
                <h1>Proyecto "${content.title}"</h1>
                <p>El estado del proyecto ha cambiado a"${content.status}"</p>
            `,
          });

          return redirect("/kanban");
        } catch {
          return json({ success: false, message: "Something went wrong!" });
        }
    }
  }else if(intent === "RESET_KANBAN"){
    try {
      await prisma.content.updateMany({
        data: {
          status: ESTADO_INACTIVO,
        },
      });
      return redirect("/kanban");
    } catch {
      return json({ success: false, message: "Algo salió mal!" });
    }
  }
};
const KanbanCard = ({
  content,
  handleDragEnd,
}: {
  content: Content;
  handleDragEnd: (e: DragEvent<HTMLAnchorElement>, id: string) => void;
}) => {
  return (
    <Link
      key={content.id}
      to={`/content/${content.id}`}
      draggable
      onDragEnd={(e) => handleDragEnd(e, content.id)}
      className=""
    >
      <Card className="my-2">
        <CardHeader className="">
          <div className="flex flex-col">
            <div className="justify-between flex flex-row">
              <CardTitle className="text-md">{content.title}</CardTitle>
              <MoveUpRight width={20} height={20} />
            </div>
            <div className="my-2">
              <Badge>{content.status}</Badge>
            </div>
            <div>
              <Badge variant="outline">
                {content.contentType.Category.name}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{content.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
const Kanban = () => {
  const submit = useSubmit();
  const { contents } = useLoaderData<typeof loader>();
  const inactiveColumnRef = useRef<HTMLDivElement>(null);
  const borradorColumnRef = useRef<HTMLDivElement>(null);
  const revisionColumnRef = useRef<HTMLDivElement>(null);
  const publicadoColumnRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (e: DragEvent<HTMLAnchorElement>, id: string) => {
    let status = "";

    const columnaInactiva = inactiveColumnRef.current?.getBoundingClientRect();
    const columnaBorrador = borradorColumnRef.current?.getBoundingClientRect();
    const columnaRevision = revisionColumnRef.current?.getBoundingClientRect();
    const columnaPublicado =
      publicadoColumnRef.current?.getBoundingClientRect();

    if (
      !columnaBorrador ||
      !columnaInactiva ||
      !columnaRevision ||
      !columnaPublicado
    )
      return;

    if (
      e.clientX <= columnaInactiva.right &&
      e.clientX >= columnaInactiva.left
    ) {
      status = ESTADO_INACTIVO;
    } else if (
      e.clientX >= columnaBorrador.left &&
      e.clientX <= columnaBorrador.right
    ) {
      status = ESTADO_BORRADOR;
    } else if (
      e.clientX >= columnaRevision.left &&
      e.clientX <= columnaRevision.right
    ) {
      status = ESTADO_REVISION;
    } else if (e.clientX > columnaPublicado.left) {
      status = ESTADO_PUBLICADO;
    }
    if (status) {
      submit({ status, intent: "STATUS_CHANGE", id }, { method: "POST" });
    }
  };
  const resetKanban = () => {
    submit({intent: "RESET_KANBAN"}, { method: "POST" });
  }
  return (
    <>
      <div className="w-full flex justify-end">
        <Form method="POST">
          <Button type="submit" variant="destructive" onClick={resetKanban} name="intent" value="RESET_KANBAN">Reiniciar tablero</Button>
        </Form>
      </div>
      <div className="mt-5 grid grid-cols-4 h-screen">
        <div className="border-r-4 border-primary-100" ref={inactiveColumnRef}>
          <h1 className="text-center mb-5">Inactivo</h1>
          <div className="px-3">
            {contents
              .filter((c) => c.status === ESTADO_INACTIVO)
              .map((c: Content) => (
                <KanbanCard
                  key={c.id}
                  content={c}
                  handleDragEnd={handleDragEnd}
                />
              ))}
          </div>
        </div>
        <div className="border-r-4 border-primary-100" ref={borradorColumnRef}>
          <h1 className="text-center mb-5">Borrador</h1>
          <div className="px-3">
            {contents
              .filter((c) => c.status === ESTADO_BORRADOR)
              .map((c: Content) => (
                <KanbanCard
                  key={c.id}
                  content={c}
                  handleDragEnd={handleDragEnd}
                />
              ))}
          </div>
        </div>
        <div className="border-r-4 border-primary-100" ref={revisionColumnRef}>
          <h1 className="text-center mb-5">En revision</h1>
          <div className="px-3">
            {contents
              .filter((c) => c.status === ESTADO_REVISION)
              .map((c: Content) => (
                <KanbanCard
                  key={c.id}
                  content={c}
                  handleDragEnd={handleDragEnd}
                />
              ))}
          </div>
        </div>
        <div className="" ref={publicadoColumnRef}>
          <h1 className="text-center mb-5">Publicado</h1>
          <div className="px-3">
            {contents
              .filter((c) => c.status === ESTADO_PUBLICADO)
              .map((c: Content) => (
                <KanbanCard
                  key={c.id}
                  content={c}
                  handleDragEnd={handleDragEnd}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Kanban;
