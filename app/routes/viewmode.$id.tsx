import { type User, type Role } from "@prisma/client";
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";
import TiptapViewMode from "~/components/TipTapViewMode";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  const id = params.id as string;

  const content = await prisma.content.findUnique({
    where: {
      id,
    }
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
  return json({ content });
};

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();
  const contentId = params.id as string;
  const text = formData.get("text");
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  if(!text || typeof text !== 'string') return json({});
  await prisma.comment.create({
    data: {
      text,
      contentId,
      userGoogleId: user.googleId,
    }, 
  });
  
  return null;
};

export default function Content() {
  const { content } =
    useLoaderData<typeof loader>();
  return (
    <div>
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{content?.title}</h1>
          <p className="text-lg font-500 text-gray-500">
            {content?.description}
          </p>
        </div>
      </div>
      <div>
        <TiptapViewMode html={content?.content ?? ""} />
      </div>
      <div className="mt-5">
        <h2 className="text-xl">Comentarios</h2>
        {/* {content.comments} */}
        <div className="mt-3">
          <Form method="POST">
            <Textarea id="text" name="text" />
            <Button className="mt-3">
              Comentar <MessageCircle className="ml-2" />
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
