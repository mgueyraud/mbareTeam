import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ActionArgs, json, type LoaderArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react";


export const loader = async ({ request, params }: LoaderArgs) => {
  (await authenticator.isAuthenticated(request)) as User;
  const id = params.id as string;
  const role = await prisma.role.findUnique({
    where: {
      id,
    },
    include: {
      permissions:true,
    },
  });
  const permisos = await prisma.permissions.findMany();

  return json({role, permisos});
};
/**
 *
 *
 * @param {ActionArgs} { request,params }
 * @return {*} 
 */
export const action = async ({ request,params }: ActionArgs) => {
  const formData = await request.formData();
  const id = params.id as string;
  const rolName = formData.get("rolname");
  const contentId = formData.get("contentId");
  const rolDescription = formData.getAll("rolDescription");
  const permissions = formData.getAll("permissions") as String[];
  console.log(permissions);
  console.log({permissions, rolName});

  if(!rolName || typeof rolName !== 'string' || !permissions || permissions.length === 0) return json({})
    const permisosEliminados = await prisma.role.update({
      where: {
        id: id,
      },
      data: {
        permissions: {
          deleteMany: {},
        },
      },
    });

    const nuevosRolePermissions = permissions.map((permisoId) => ({
      roleId: permisosEliminados.id,
      permissionsId: permisoId,
    }));

    const rolePermissionsCreados = await prisma.rolePermissions.createMany({
      data: nuevosRolePermissions,
    });
  
  return redirect("/content/"+contentId);
};

/**
 *
 *
 * @export
 * @return {*} 
 */
export default function EditRole() {
  const { role,permisos } = useLoaderData<typeof loader>();
  console.log(role);
  const navigation = useNavigate();


  return (
    <div>
      <Form method="POST">
        <input type="hidden" value={role?.contentId as string} />
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rolname">Nombre del rol</Label>
          <Input id="rolname" name="rolname" defaultValue={role?.name} required/>
          <Label htmlFor="rolDescription">Descripción </Label>
          <Input id="rolDescription" name="rolDescription" defaultValue={role?.description} required/>
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
              {permisos.map((permiso) => (
              <TableRow
                key={permiso.id}
              >
                <TableCell ><Checkbox id={permiso.id} name="permissions" defaultChecked={role != null && role?.permissions.filter((p) => p.permissionsId==permiso.id).length>0} value={permiso.id} /></TableCell>
                <TableCell className="font-medium text-right">{permiso.name}</TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
        <Button
          className="mt-4"
        >
            Actualizar
        </Button>
      </Form>
    </div>
  );
}
