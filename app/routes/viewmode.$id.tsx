import { type User, type Role, Comment } from "@prisma/client";
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";
import TiptapViewMode from "~/components/TipTapViewMode";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import { ESTADO_PUBLICADO } from "~/utils/constants";

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request)) as User;

  const id = params.id as string;

  const content = await prisma.content.findUnique({
    where: {
      id,
    },
    select: {
      comments: {
        include: {
          User: true,
        },
      },
      userGoogleId: true,
      description: true,
      title: true,
      content: true,
      status: true,
    },
  });

  if (content?.status !== ESTADO_PUBLICADO) return redirect("/home");

  return json({ content, user });
};

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();
  const contentId = params.id as string;
  const text = formData.get("text");
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  if (!text || typeof text !== "string") return json({});
  console.log(user);
  await prisma.comment.create({
    data: {
      text,
      contentId,
      userGoogleId: user.googleId,
    },
  });

  return null;
};

const CommentCmp = ({ user, comment }: { user: any; comment: any }) => (
  <div className="flex items-center space-x-4">
    <Avatar>
      <AvatarImage src={user?.picture} />
      <AvatarFallback>{user?.email}</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-sm font-medium leading-none">{user?.name}</p>
      <p className="text-sm text-muted-foreground">{comment?.text}</p>
    </div>
  </div>
);

export default function Content() {
  const { content, user } = useLoaderData<typeof loader>();
  let transition = useNavigation();
  let isAdding = transition.state === "submitting";
  let formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  });
  console.log(content);
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
        {content?.comments.length === 0 && <p>No hay comentarios :(</p>}
        {content?.comments.map((comment) => (
          <div className="my-3" key={comment.id}>
            <CommentCmp user={comment.User} comment={comment} />
          </div>
        ))}
        <div className="mt-3">
          <Form method="POST" ref={formRef}>
            <Textarea id="text" name="text" />
            <Button
              className="mt-3"
              type="submit"
              disabled={user ? false : true}
            >
              Comentar <MessageCircle className="ml-2" />
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
