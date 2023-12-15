
import { type ActionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import { ESTADO_PUBLICADO } from "~/utils/constants";
import { useLoaderData } from "@remix-run/react";

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
    const categoriesWithMostContents = await prisma.category.findMany({
        where: {
            isActive: true,
        },
        include: { type_of_contents: { include: { 
            Content: true // This will include all Content records related to each ContentType 
            }
        }}
    }); // Calculate the total number of contents for each category 
    const categoriesWithContentCounts = categoriesWithMostContents.map(category => {
        let totalCount = 0;
        category.type_of_contents.forEach(contentType => {
            totalCount += contentType.Content.length; // Summing the number of contents in each content type 
        });
        return { ...category, contentCount: totalCount }; 
    }); // Sort categories based on the total content count 
    const sortedCategories = categoriesWithContentCounts.sort((a, b) => b.contentCount - a.contentCount); // Now, sortedCategories is an array of categories, sorted by the number of contents they have, in descending order.

    return {
        contents,
        sortedCategories,
    };
};
const Reportes = () => {
    const { sortedCategories, contents } = useLoaderData<typeof loader>();
    console.log(sortedCategories);
    const contentsLikeCount = contents.sort((c1, c2) => c1.likeCount > c2.likeCount ? -1 : 1);
    const contentsDislikeCount = contents.sort((c1, c2) => c1.dislikeCount > c2.dislikeCount ? -1 : 1);
    return (
        <>
            <h2 className="text-xl font-bold mb-3">Reportes</h2>
            <section className="mb-5">
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>Categorias con mas contenidos</th>
                        </tr>
                        <tr>
                            <th className="border p-2">Categoria</th>
                            <th className="border p-2">Cuenta de contenidos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCategories.map(cat => (
                            <tr key={cat.id}>
                                <td className="border p-2">{cat.name}</td>
                                <td className="border p-2">{cat.contentCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section className="my-5">
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                Contenidos con mas likes
                            </th>
                        </tr>
                        <tr>
                            <th className="border p-2">Contenido</th>
                            <th className="border p-2">Cuenta de likes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contentsLikeCount.map(content => (
                            <tr key={content.id}>
                                <td className="border p-2">{content.title}</td>
                                <td className="border p-2">{content.likeCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section className="my-5">
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                Contenidos con mas dislikes
                            </th>
                        </tr>
                        <tr>
                            <th className="border p-2">Contenido</th>
                            <th className="border p-2">Cuenta de dislikes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contentsDislikeCount.map(content => (
                            <tr key={content.id}>
                                <td className="border p-2">{content.title}</td>
                                <td className="border p-2">{content.dislikeCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h3 className="text-lg">Contenido mas comentado</h3>
            <h3 className="text-lg">Contenido menos comentado</h3>
            <h3 className="text-lg">Tipo de contenido con mas contenido</h3>
        </>
    );
};

export default Reportes;
