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
  const title = formData.get("title");
  const description = formData.get("description");

  if (
    !title ||
    !description ||
    typeof title !== "string" ||
    typeof description !== "string"
  )
    return json({ success: false, message: "You should enter valid data" });

  try {
    await prisma.content.create({
      data: {
        title,
        description,
        userGoogleId: user.googleId,
      },
    });
  } catch {
    return json({ success: false, message: "Something went wrong!" });
  }

  return redirect("/dashboard");
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  return {
    user,
  };
};

export default function CreateContent() {
  const data = useActionData<typeof action>();
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
      <h1 className="text-2xl font-bold">Create new content</h1>
      <Form method="POST">
        <div className="grid w-full items-center gap-1.5 mt-4">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" />
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
