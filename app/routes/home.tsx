import { Button } from "@/components/ui/button";
import { redirect, type ActionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { FilePlus2, MoveUpRight, Search, ThumbsDown, ThumbsUp, MessageCircle } from "lucide-react";
import { prisma } from "~/utils/db.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DropdownMenu from "@/components/ui/dropdownmenu";
import { ESTADO_PUBLICADO } from "~/utils/constants";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// file: app/routes/dashboard.js
export const action = async({request, params}: ActionArgs) => {
  const id = params.id as string;
  const formData = await request.formData();
  const likeCount = formData.get('likeCount');
  const dislikeCount = formData.get('dislikeCount');
  const contentId = formData.get('contentId');
  if (
    !contentId ||
    typeof contentId !== "string"
  )
    return json({ success: false, message: "You should enter valid data" });
  try {
    let content = await prisma.content.findFirst({
      where: {
        id: id ? id : contentId
      },
      select: {
        likeCount: true,
        dislikeCount: true,
      }
    });
    content = await prisma.content.update({
      where: {
        id: contentId,
      },
      data: {
        likeCount: typeof likeCount === 'string' ? Number(likeCount) : content?.likeCount || 0,
        dislikeCount: typeof dislikeCount === 'string' ? Number(dislikeCount) : content?.dislikeCount || 0,
      },
    });
    return redirect('/home');
  } catch (error) {
    return json({ success: false, message: "Something went wrong!" });
  }
}
export const loader = async ({ request }: ActionArgs) => {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('categoryId');
  const name = url.searchParams.get('name');
  
  const contents = await prisma.content.findMany({
    where: {
      AND: [
        {
          status: ESTADO_PUBLICADO,
        },
        {
          title: name ? {
            search: name,
          } : {},
          contentType: categoryId ? {
            categoryId,
          } : {},
        }
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      likeCount: true,
      dislikeCount: true,
    },
  });

  const categorias = await prisma.category.findMany( );
  return {
    contents,
    categorias,
  };
};
const HomeCard = ({ content }: { content: any }) => {
  return (
    <Card className="w-[350px]" key={content.id} >
      <CardHeader className="justify-between flex-row">
        <CardTitle>{content.title}</CardTitle>
        <MoveUpRight width={20} height={20} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center">
          <div className="w-3/4">
            <CardDescription>{content.description}</CardDescription>
          </div>
          <div className="w-1/4">
            <div className="mb-1">
              <Badge variant="secondary" className="w-[4rem] flex flex-row items-center text-gray-400">
                <span className="text-sm mr-2">
                  {content.likeCount} 
                </span>
                <ThumbsUp size={20} />
              </Badge>
            </div>
            <div>
              <Badge variant="secondary" className="w-[4rem] flex flex-row items-center text-gray-400">
                <span className="text-sm mr-2">
                  {content.dislikeCount} 
                </span>
                <ThumbsDown size={20} />
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Form method="POST">
          <Input type="hidden" name="contentId" value={content.id}/>
          <Button size="sm" variant="outline" type="submit" name="likeCount" className="mr-1" value={content.likeCount + 1}><ThumbsUp /></Button>
        </Form>
        <Form method="POST">
          <Input type="hidden" name="contentId" value={content.id}/>
          <Button size="sm" variant="outline" type="submit" name="dislikeCount" value={content.dislikeCount + 1}><ThumbsDown /></Button>
        </Form>
      </CardFooter>
    </Card>
  );
}
const Home = () => {
  const { contents , categorias } = useLoaderData<typeof loader>();
  const categoria_select = function(option : ActionArgs){
    console.log("opcion: ", option);
  }
  const contenidoDestacado = contents.filter(c => c.likeCount >= 3);
  const contenidoRestante = contents.filter(c => c.likeCount < 3);
  return (
    <>
      <Form method="GET">
        <div className="flex justify-between">
          <div className="flex flex-row gap-3 items-center">
            <DropdownMenu title= "Selecciona una Categoría" opciones={categorias} onChange={categoria_select} name="categoryId"></DropdownMenu>
            <Input name="name" placeholder="Buscar por titulo..." />
            <Button type="submit"><Search/></Button>
          </div>
        </div>
      </Form>
        {contents.length === 0 ? (
          <div className="border border-dashed rounded w-full py-10 flex flex-col items-center mt-8">
            <FilePlus2 className="text-gray-500" height={60} width={60} />
            <h2 className="text-xl font-bold mt-3">No content</h2>
          </div>
        ) : (
          <>
            <div className="mt-5 py-3">
              <h2 className="font-bold">Contenido destacado</h2>
              <div className="mt-5 flex gap-8 flex-wrap">
                {contenidoDestacado.map((content) => (
                  <HomeCard content={content} key={content.id}/>
                ))}
              </div>
            </div>
            <div className="border-t-2 py-3">
              <h2 className="font-bold">Contenido</h2>
              <div className="mt-5 flex gap-8 flex-wrap">
                {contenidoRestante.map((content) => (
                  <HomeCard content={content} key={content.id}/>
                ))}
              </div>
            </div>
          </>
        )}
    </>
  );
};

export default Home;
