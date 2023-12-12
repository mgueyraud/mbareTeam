import { Content, User } from "@prisma/client";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
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
import { ESTADO_BORRADOR, ESTADO_INACTIVO, ESTADO_PUBLICADO, ESTADO_REVISION } from "~/utils/constants";
import { DragEvent } from "react";

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
  
    const categorias = await prisma.category.findMany();
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
    console.log({id, status, intent})
    // if()
    if (typeof intent === "string" && typeof id === "string" && typeof status === "string") {
        try {
            const content = await prisma.content.update({
                where: {
                    id,
                },
                data: {
                    status,
                },
            });
            return redirect("/kanban");
        } catch {
            return json({ success: false, message: "Something went wrong!" });
        }
    }
};
const KanbanCard = ({ content }: { content: Content }) => {
    const submit = useSubmit();
    const handleDragEnd = (e: DragEvent<HTMLAnchorElement>) => {
        let status = '';
        if(e.clientX < 475){
            status = ESTADO_INACTIVO
        } else if(e.clientX >= 660 && e.clientX <= 900){
            status = ESTADO_BORRADOR
        } else if(e.clientX >= 930 && e.clientX <= 1250){
            status = ESTADO_REVISION
        } else if(e.clientX > 1280){
            status = ESTADO_PUBLICADO
        }
        if(status){
            submit(
                { status, intent: 'STATUS_CHANGE', id: content.id },
                { method: "POST"}
            );
        }
    }
    return (
        <Link key={content.id} to={`/content/${content.id}`} draggable onDragEnd={handleDragEnd}>
            <Card className="">
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
}
const Kanban = () => {
    const { user, contents, categorias } = useLoaderData<typeof loader>();
    return (
        <div className="mt-5 grid grid-cols-4 h-screen">
            <div className="border-r-4 border-primary-100">
                <h1 className="text-center mb-5">Inactivo</h1>
                <div className="px-3">
                    {contents.filter(c => c.status === ESTADO_INACTIVO).map((c: Content) => (
                        <KanbanCard key={c.id} content={c}/>
                    ))}
                </div>
            </div>
            <div className="border-r-4 border-primary-100">
                <h1 className="text-center mb-5">Borrador</h1>
                <div className="px-3">
                    {contents.filter(c => c.status === ESTADO_BORRADOR).map((c: Content) => (
                        <KanbanCard key={c.id} content={c}/>
                    ))}
                </div>
            </div>
            <div className="border-r-4 border-primary-100">
                <h1 className="text-center mb-5">En revision</h1>
                <div className="px-3">
                    {contents.filter(c => c.status === ESTADO_REVISION).map((c: Content) => (
                        <KanbanCard key={c.id} content={c}/>
                    ))}
                </div>
            </div>
            <div className="">
                <h1 className="text-center mb-5">Publicado</h1>
                <div className="px-3">
                    {contents.filter(c => c.status === ESTADO_PUBLICADO).map((c: Content) => (
                        <KanbanCard key={c.id} content={c}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Kanban;
