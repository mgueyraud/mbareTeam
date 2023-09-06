import { type User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export async function getUsers(){
    const users = await prisma.user.findMany();
    return users;
}

export async function createUser(user: User){
    const newUser = prisma.user.create({
        data: user
    })

    return newUser;
}