
import { type ActionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import { ESTADO_PUBLICADO } from "~/utils/constants";

export const loader = async ({ request }: ActionArgs) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const name = url.searchParams.get("name");

    const contents = await prisma.content.findMany({
        where: {
            AND: [
                {
                    status: ESTADO_PUBLICADO,
                },
                {
                    title: name
                        ? {
                            search: name,
                        }
                        : {},
                    contentType: categoryId
                        ? {
                            categoryId,
                        }
                        : {},
                },
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

    const categorias = await prisma.category.findMany({
        where: {
            isActive: true,
        }
    });
    return {
        contents,
        categorias,
    };
};
const Reportes = () => {

    return (
        <>
            Reportes
        </>
    );
};

export default Reportes;
