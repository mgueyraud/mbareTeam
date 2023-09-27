import { PrismaClient } from "@prisma/client";

//Comando para correr el seed: 
//npx prisma db seed

const prisma = new PrismaClient();

async function main(){
  
  console.time('🧹 Cleaned up the database...')
  await prisma.user.deleteMany()
	console.timeEnd('🧹 Cleaned up the database...')
  console.time('👤 Creando usuario Lopez...')
  const userJavier = await prisma.user.create({
    data:{
      googleId:'117690194297612949818',
      email:'javierlopez9805@gmail.com',
      name:'Lopez',
      picture:'https://lh3.googleusercontent.com/a/AAcHTtdKkhn0ckrzWO_str86R90QGALfPe3Ro8u-cvd3DvYpri-a=s96-c',
      username:'rafa',
      description:'',

    }
  })
  console.timeEnd('👤 Creando usuario Lopez...')
  
  console.time('👤 Creando usuario Gueyraud...')
  await prisma.user.create({
    data:{
      googleId:'107504557768878217220',
      email:'mgueyraud.junior@gmail.com',
      name:'Gueyraud',
      picture:'https://lh3.googleusercontent.com/a/AAcHTtdMFYPY1s2tLZftY6ZVDjYMi6vjEBNDMheEDpdvlc8n0mY=s96-c',
      username:'mario',
      description:'',
      
    }
  })
  console.timeEnd('👤 Creando usuario Gueyraud...')

  console.time('💻 Creando contenido prueba...')
  await prisma.content.create({
    data:{
      title:"prueba de roles",
      description:"this just is a test",
      userGoogleId:userJavier.googleId,
    }
  })
  console.timeEnd('💻 Creando contenido prueba...')

  console.time('✅ Creando permiso editar...')
  await prisma.permissions.create({
    data:{
      name:"editar",      
      type:'general',
    }
  })
  console.timeEnd('✅ Creando permiso editar...')

  console.time('✅ Creando permiso leer...')
  await prisma.permissions.create({
    data:{
      name:"leer",      
      type:'general',
    }
  })
  console.timeEnd('✅ Creando permiso leer...')

    // await prisma.user.create({
    //     data: {
    //         username: 'mario',
    //         name: 'mario'
    //     }
    // });
  
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // console.log(await prisma.user.findMany())
    await prisma.$disconnect()
  })
