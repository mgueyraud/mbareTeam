import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons";
import { type ActionArgs, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { Checkbox } from "@/components/ui/checkbox"

export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = (await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  })) as User;

  const data = await prisma.permissions.findMany();
  return json(data);
};


export default function CreateRole() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  console.log(data)
  const isLoadingUpdate =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "update";

  return (
    <div>
      <Form method="POST">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="rolname">Nombre del rol</Label>
          <Input id="rolname" name="rolname" />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5 mt-5">
        {data.map((data) => (
          <div key={data.id}>
            <Checkbox id={data.id}/>
            <label
              htmlFor="terms2"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-3"
            >
              {data.name}
            </label>
          </div>  
        ))}       
        </div>
        <Button
          className="mt-4"
          name="intent"
          value="update"
          disabled={isLoadingUpdate}
        >
          {isLoadingUpdate ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear"
          )}
        </Button>
      </Form>{" "}
    </div>
  );
}
