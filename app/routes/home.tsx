import { Button } from "@/components/ui/button";
import { redirect, type ActionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { FilePlus2, MoveUpRight } from "lucide-react";
import { prisma } from "~/utils/db.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DropdownMenu from "@/components/ui/dropdownmenu";

// file: app/routes/dashboard.js
export const loader = async ({ request }: ActionArgs) => {
  const contents = await prisma.content.findMany({
    where: {
      // status: 'Publicado'
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  const categorias = await prisma.category.findMany( );
  return {
    contents,
    categorias
  };
};

const Home = () => {
  const { contents , categorias } = useLoaderData<typeof loader>();
  const categoria_select=function(option : ActionArgs){
    console.log("opcion: ", option);
  }
  return (
    <div>
      <div className="flex justify-between">
        <div>
          <DropdownMenu opciones={categorias} onChange={categoria_select}></DropdownMenu>
        </div>
      </div>
      {contents.length === 0 ? (
        <div className="border border-dashed rounded w-full py-10 flex flex-col items-center mt-8">
          <FilePlus2 className="text-gray-500" height={60} width={60} />
          <h2 className="text-xl font-bold mt-3">No content</h2>
          <Button className="mt-5" asChild>
            <Link to="/create/content">Create a new content</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex gap-8 flex-wrap">
          {contents.map((content) => (
            <Card className="w-[350px]">
              <CardHeader className="justify-between flex-row">
                <CardTitle>{content.title}</CardTitle>
                <MoveUpRight width={20} height={20} />
              </CardHeader>
              <CardContent>
                <CardDescription>{content.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;