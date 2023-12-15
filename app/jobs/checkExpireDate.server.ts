import { intervalTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger.server";
import { prisma } from "~/utils/db.server";

export const job = client.defineJob({
  id: "check-expire-date",
  name: "Chequear la fecha de vigencia de contenidos",
  version: "0.0.1",
  trigger: intervalTrigger({
    seconds: 60,
  }),
  run: async (payload, io, ctx) => {

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
    
    // Use the random number in a joke and log it to the console.
    await io.logger.info(`All contents were updates`);

  },
});
