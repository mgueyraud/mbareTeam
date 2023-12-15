import { Button } from "@/components/ui/button";
import type { User } from "@prisma/client";
import { redirect, type ActionArgs, json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { FilePlus2, MoveUpRight, Trash, CheckCircle } from "lucide-react";
import { prisma } from "~/utils/db.server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// file: app/routes/dashboard.js
export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = (await authenticator.isAuthenticated(request)) as User;
  if(!user){
    return redirect("/");
  }
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
    }
  });
  return {
    user,
    categories,
  };
};
export const action = async ({ request, params }: ActionArgs) => {
  const user = (await authenticator.isAuthenticated(request)) as User;
  if (!user) {
    return redirect("/");
  }
  const formData = await request.formData();
  const id = formData.get("id");
  const intent = formData.get("intent");

  if (typeof intent === "string" && intent === "DELETE" && typeof id === "string"){
    try {
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          isActive: false,
        },
      });
      return null;
    } catch (error) {
      return json({ success: false, message: "Something went wrong!" });
    }
  }else if (typeof intent === "string" && intent === "ACTIVATE" && typeof id === "string"){
    try {
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          isActive: true,
        },
      });
      return null;
    } catch (error) {
      return json({ success: false, message: "Something went wrong!" });
    }
  }
}
const ContentList = () => {
  const { categories } = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="flex justify-between">
        <div>
          <Button asChild>
            <Link to="/create/contenttype">
              <FilePlus2 className="text-white" height={20} width={20} />
            </Link>
          </Button>
        </div>

      </div>
      {categories.length === 0 ? (
        <div className="border border-dashed rounded w-full py-10 flex flex-col items-center mt-8">
          <FilePlus2 className="text-gray-500" height={60} width={60} />
          <h2 className="text-xl font-bold mt-3">No hay categorias</h2>
        </div>
      ) : (
        <div className="mt-5 flex gap-8 flex-wrap">
          {categories.map((category) => (
            <Card className="w-[350px]" key={category.id}>
              <CardHeader className="justify-between flex flex-row items-center">
                <CardTitle>{category.name}</CardTitle>
                <Form method="POST" className="flex items-center w-28 justify-end">
                  <span className="">
                    <MoveUpRight />
                  </span>
                  <input type="hidden" value={category.id} name="id" />
                  {category.isActive && <button type="submit" name="intent" value="DELETE" className="w-20 ml-3 cursor-pointer">
                    <Trash />
                  </button>}
                  {!category.isActive && <button type="submit" name="intent" value="ACTIVATE" className="w-20 ml-3 cursor-pointer">
                    <CheckCircle />
                  </button> }
                </Form>
              </CardHeader>
              <CardContent>
                <Badge variant={category.isActive ? "default" :"destructive"}>{category.isActive ? 'Activo': 'Inactivo'}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentList;
