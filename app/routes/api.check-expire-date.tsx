import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function loader() {
  const currentDate = new Date().toISOString();

  const updatedRecords = await prisma.content.updateMany({
    where: {
      expireDate: {
        lt: currentDate,
      },
      status: {
        not: "Inactivo",
      },
    },
    data: {
      status: "Inactivo",
    },
  });

  console.log({ updatedRecords });

  return json(null);
}
