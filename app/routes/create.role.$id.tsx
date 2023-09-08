import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons";
import { type ActionArgs, json, type LoaderArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { Checkbox } from "@/components/ui/checkbox";

export const loader = async ({ request, params }: LoaderArgs) => {
  (await authenticator.isAuthenticated(request)) as User;
  const id = params.id as string;

  const content = await prisma.content.findUnique({
    where: {
      id,
    },
  });
  const data = await prisma.permissions.findMany();

  return json({content, data});
};

export const action = async ({ request,params }: ActionArgs) => {
  const formData = await request.formData();
  const id = params.id as string;
  const rolName = formData.get("rolname");
  const permissions = formData.getAll("permissions") as string[];

  console.log({permissions, rolName});

  if(!rolName || typeof rolName !== 'string' || !permissions || permissions.length === 0) return json({});

  const role = await prisma.role.create({
    data:{
      name:rolName,
      permissions: {
        connect: permissions.map((permission) => ({id:permission}))
      },
      contentId: id,
    }
  });
  
  return redirect("/content/"+id);
};


export default function CreateRole() {
  const { content,data } = useLoaderData<typeof loader>();
  const navigation = useNavigate();

  return (
    <div>
      <Form method="POST">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rolname">Nombre del rol</Label>
          <Input id="rolname" name="rolname" required/>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-5">
        {data.map((data) => (
          <div key={data.id}>
            <Checkbox id={data.id} name="permissions" value={data.id}/>
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-3"
            >
              {data.name}
            </label>
          </div>  
        ))}       
        </div>
        <Button
          className="mt-4"
        >
            Crear
        </Button>
      </Form>{" "}
    </div>
  );
}
