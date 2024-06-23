import { PrismaClient } from "@prisma/client";

export async function getStaticProps() {
    const prisma = new PrismaClient();
    const posts = await prisma.store.findMany();
    
    return {
        props: {posts},
    };
}