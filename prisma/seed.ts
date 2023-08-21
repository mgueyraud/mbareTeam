import { PrismaClient } from "@prisma/client";

//Comando para correr el seed: 
//npx prisma db seed

const prisma = new PrismaClient();

async function main(){
    console.time('🧹 Cleaned up the database...')
	await prisma.user.deleteMany()
	console.timeEnd('🧹 Cleaned up the database...')

    await prisma.user.create({
        data: {
            username: 'mario',
            name: 'mario'
        }
    });

}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    console.log(await prisma.user.findMany())
    await prisma.$disconnect()
  })
