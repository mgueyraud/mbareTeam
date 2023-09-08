import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@prisma/client";
import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Editor } from "novel";
import { useState } from "react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  (await authenticator.isAuthenticated(request)) as User;

  const id = params.id as string;

  const content = await prisma.content.findUnique({
    where: {
      id,
    },
  });

  const roles = await prisma.role.findMany({
    where: {
      contentId:id,
    },
  });

  return json({ content, roles });
};

export default function Content() {
  const { content,roles } = useLoaderData<typeof loader>();
  const [htmlContent, setHtmlContent] = useState("");
  const navigate = useNavigate();
  const id = content?.id as String
  const navigateToCreateRole = () => {
    navigate(`/create/role/`+id);
  }
  
  const updateContent = (editor) => {
    console.log(editor);
    const content = localStorage.getItem("novel__content");
    setHtmlContent(JSON.stringify(content));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">{content?.title}</h1>
      <p className="text-lg font-500 text-gray-500">{content?.description}</p>

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
              defaultValue=""
              onDebouncedUpdate={updateContent}
              debounceDuration={1000}
            />
          </div>
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <h2 className="text-xl font-bold mt-5">Roles</h2>
          <div>
            <ul>
              {roles.map((roles) => (
                <li 
                  key={roles.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-3"
                >
                  {roles.name}
                </li>
              ))}
            </ul>
          </div>
          <Button
          onClick={navigateToCreateRole}
          className="mt-4"
          name="intent"
        >Agregar rol</Button>
        </TabsContent>
        <TabsContent value="collaborators" className="space-y-4">
          <h2 className="text-xl font-bold mt-5">Collaborators</h2>
        </TabsContent>
      </Tabs>
    </div>
  );
}
