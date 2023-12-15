
import { type ActionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import { ESTADO_PUBLICADO } from "~/utils/constants";
import { useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Save } from "lucide-react";

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
            comments: true,
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

    const typeContent = await prisma.contentType.findMany({
        select: {
            name: true,
            Content: true,
            id: true,
        },
    });
    return {
        contents,
        sortedCategories,
        typeContent,
    };
};
const Reportes = () => {
    const { sortedCategories, contents, typeContent } = useLoaderData<typeof loader>();

    const contentsLikeCount = [...contents];
    const contentsDislikeCount = [...contents];
    contentsLikeCount.sort((c1, c2) => c1.likeCount > c2.likeCount ? -1 : 1);
    contentsDislikeCount.sort((c1, c2) => c1.dislikeCount > c2.dislikeCount ? -1 : 1);
    const mostCommented = contents.map(c => ({...c, commentCount: c.comments.length}));
    mostCommented.sort((c1, c2) => c1.commentCount > c2.commentCount ? -1 : 1);
    const lessCommented  = [...mostCommented];
    lessCommented.sort((c1, c2) => c1.commentCount < c2.commentCount ? -1 : 1);
    typeContent.sort((t1, t2) => t1.Content.length > t2.Content.length ? -1 : 1);
    
    const reporte1Ref = useRef<HTMLElement | null>(null);
    const reporte2Ref = useRef<HTMLElement | null>(null);
    const reporte3Ref = useRef<HTMLElement | null>(null);
    const reporte4Ref = useRef<HTMLElement | null>(null);
    const reporte5Ref = useRef<HTMLElement | null>(null);
    const reporte6Ref = useRef<HTMLElement | null>(null);

    const print = (ref: React.MutableRefObject<HTMLElement | null>) => useReactToPrint({
        content: () => ref.current,
    });
    return (
        <>
            <h2 className="text-xl font-bold mb-3">Reportes</h2>
            <section className="mb-5" ref={reporte1Ref}>
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                <div className="flex gap-3 justify-between">
                                    Categorias con mas contenidos
                                    <span className="cursor-pointer" onClick={print(reporte1Ref)}>
                                        <Save />
                                    </span>    
                                </div>
                            </th>
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
            <section className="my-5" ref={reporte2Ref}>
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                <div className="flex gap-3 justify-between">
                                    Contenidos con mas likes
                                    <span className="cursor-pointer" onClick={print(reporte2Ref)}>
                                        <Save />
                                    </span>    
                                </div>
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
            <section className="my-5"  ref={reporte3Ref}>
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                <div className="flex gap-3 justify-between">
                                    Contenidos con mas dislikes
                                    <span className="cursor-pointer" onClick={print(reporte3Ref)}>
                                        <Save />
                                    </span>    
                                </div>
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
            <section className="my-5" ref={reporte4Ref}>
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                <div className="flex gap-3 justify-between">
                                    Contenido mas comentado
                                    <span className="cursor-pointer" onClick={print(reporte4Ref)}>
                                        <Save />
                                    </span>    
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th className="border p-2">Contenido</th>
                            <th className="border p-2">Cantidad de comentarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mostCommented.map(content => (
                            <tr key={content.id}>
                                <td className="border p-2">{content.title}</td>
                                <td className="border p-2">{content.commentCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section className="my-5" ref={reporte5Ref}>
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                <div className="flex gap-3 justify-between">
                                    Contenido menos comentado
                                    <span className="cursor-pointer" onClick={print(reporte5Ref)}>
                                        <Save />
                                    </span>    
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th className="border p-2">Contenido</th>
                            <th className="border p-2">Cantidad de comentarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessCommented.map(content => (
                            <tr key={content.id}>
                                <td className="border p-2">{content.title}</td>
                                <td className="border p-2">{content.commentCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section className="my-5" ref={reporte6Ref}>
                <table>
                    <thead>
                        <tr>
                            <th className="border p-2" colSpan={2}>
                                
                                <div className="flex gap-3 justify-between">
                                Tipo de contenido con mas contenido
                                    <span className="cursor-pointer" onClick={print(reporte6Ref)}>
                                        <Save />
                                    </span>    
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th className="border p-2">Tipo de Contenido</th>
                            <th className="border p-2">Cantidad de contenido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {typeContent.map(content => (
                            <tr key={content.id}>
                                <td className="border p-2">{content.name}</td>
                                <td className="border p-2">{content.Content.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default Reportes;
