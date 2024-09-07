import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

export async function GET (
    req: Request,
    { params }: { params: { creatorId: string }}
) {
    try {
        if(!params.creatorId) {
            return new NextResponse("creator id is required", { status: 400 });
        }

        const creator = await prismadb.creator.findUnique({
            where: {
                id: params.creatorId,
            }
        })

        return NextResponse.json(creator);
    } catch (err) {
        console.log('[CREATOR_GET]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, creatorId: string }}
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }


        if(!params.creatorId) {
            return new NextResponse("creator id is required", { status: 400 });
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

        const creator = await prismadb.creator.updateMany({
            where: {
                id: params.creatorId
            },
            data: {
                name,
            }
        })

        return NextResponse.json(creator);
    } catch (err) {
        console.log('[CREATOR_PATCH]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

//// Delete Method

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, creatorId: string }}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if(!params.creatorId) {
            return new NextResponse("creator id is required", { status: 400 });
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

        const creator = await prismadb.creator.deleteMany({
            where: {
                id: params.creatorId,
            }
        })

        return NextResponse.json(creator);
    } catch (err) {
        console.log('[CREATOR_DELETE]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}