import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ActionArgs, json, type LoaderArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


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
  const rolDescription = formData.get("rolDescription") as string;
  const permissions = formData.getAll("permissions") as string[];

  console.log({permissions, rolName});

  if(!rolName || typeof rolName !== 'string' || !permissions || permissions.length === 0) return json({});
  console.log(permissions);
  const nuevoRol = await prisma.role.create({
    data:{
      name:rolName,
      description:rolDescription,
      contentId: id,
    }
  });
  await prisma.rolePermissions.createMany({
    data: permissions.map((perm) => ({
      roleId: nuevoRol.id,
      permissionsId: perm
    }))
  });
  return redirect("/content/"+id);
};


export default function CreateRole() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <div>
      <Form method="POST">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rolname">Nombre del rol</Label>
          <Input id="rolname" name="rolname" required/>
          <Label htmlFor="rolDescription">Descripción </Label>
          <Input id="rolDescription" name="rolDescription" required/>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Nombre</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((data) => (
              <TableRow
                key={data.id}
              >
                <TableCell ><Checkbox id={data.id} name="permissions" value={data.id}/></TableCell>
                <TableCell className="font-medium text-right">{data.name}</TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button
          className="mt-4"
        >
            Crear
        </Button>
      </Form>
    </div>
  );
}
