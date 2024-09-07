import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name } = body; 

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400});
        }

        if (!params.storeId) {
            return new NextResponse("Store Id is required", { status: 400});
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const creator = await prismadb.creator.create({
            data : {
                name,
                storeId: params.storeId
            }
        })

        return NextResponse.json(creator);

    } catch (err) {
        console.log(`[CREATOR_POST] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store Id is required", { status: 400});
        }

        const creators = await prismadb.creator.findMany({
            where: {
                storeId: params.storeId
            }
        })

        return NextResponse.json(creators);

    } catch (err) {
        console.log(`[CREATORS_GET] ${err}`);
        return new NextResponse(`Internal error`, { status: 500})
    }
}