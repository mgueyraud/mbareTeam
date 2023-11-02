import { Button } from "@/components/ui/button";
import type { User } from "@prisma/client";
import { redirect, type ActionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { FilePlus2, MoveUpRight } from "lucide-react";
import { prisma } from "~/utils/db.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// file: app/routes/dashboard.js
export const loader = async ({ request }: ActionArgs) => {
  // authenticator.isAuthenticated function returns the user object if found
  // if user is not authenticated then user would be redirected back to homepage ("/" route)
  const user = (await authenticator.isAuthenticated(request)) as User;
  if(!user){
    return redirect("/");
  }
  const contentTypes = await prisma.contentType.findMany( );
  return {
    user,
    contentTypes,
  };
};

const ContentList = () => {
  const { contentTypes } = useLoaderData<typeof loader>();

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
      {contentTypes.length === 0 ? (
        <div className="border border-dashed rounded w-full py-10 flex flex-col items-center mt-8">
          <FilePlus2 className="text-gray-500" height={60} width={60} />
          <h2 className="text-xl font-bold mt-3">No content</h2>
          {/* <Button className="mt-5" asChild>
            <Link to="/create/content">Create a new content</Link>
          </Button> */}
        </div>
      ) : (
        <div className="mt-5 flex gap-8 flex-wrap">
          {contentTypes.map((contentType) => (
            <Card className="w-[350px]">
                <CardHeader className="justify-between flex-row">
                    <CardTitle>{contentType.name}</CardTitle>
                    <MoveUpRight width={20} height={20} />
                </CardHeader>
                <CardContent>
                    <CardDescription>{contentType.description}</CardDescription>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentList;
